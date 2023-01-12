"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Time_Period = void 0;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var Pool = require('pg').Pool;
var jwt = require('jsonwebtoken');
var start_of_week = require('date-fns/startOfWeek');
var end_of_week = require('date-fns/endOfWeek');
var is_same_day = require('date-fns/isSameDay');
var date_fns_1 = require("date-fns");
require('dotenv').config({ path: '/home/michael/.env' });
require('dotenv').config();
var secret_key = process.env.JWT_SECRET_KEY;
var types = require('pg').types;
types.setTypeParser(1700, function (val) {
    return parseFloat(val);
});
;
;
var Time_Period;
(function (Time_Period) {
    Time_Period[Time_Period["DAY"] = 0] = "DAY";
    Time_Period[Time_Period["WEEK"] = 1] = "WEEK";
    Time_Period[Time_Period["MONTH"] = 2] = "MONTH";
    Time_Period[Time_Period["YEAR"] = 3] = "YEAR";
})(Time_Period = exports.Time_Period || (exports.Time_Period = {}));
var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = 3001;
var formatMemoryUsage = function (data) { return "".concat(Math.round(data / 1024 / 1024 * 100) / 100, " MB"); };
setInterval(function () {
    var memoryData = process.memoryUsage();
    var memoryUsage = {
        rss: "".concat(formatMemoryUsage(memoryData.rss), " -> Resident Set Size - total memory allocated for the process execution"),
        heapTotal: "".concat(formatMemoryUsage(memoryData.heapTotal), " -> total size of the allocated heap"),
        heapUsed: "".concat(formatMemoryUsage(memoryData.heapUsed), " -> actual memory used during the execution"),
        external: "".concat(formatMemoryUsage(memoryData.external), " -> V8 external memory")
    };
    console.log(memoryUsage);
}, 5000);
var pool = new Pool({
    user: 'postgres',
    password: process.env.PG_PASSWORD,
    host: 'localhost',
    database: 'budget_app'
});
pool.on('error', function (err, client) {
    console.log("POOL ERROR");
    console.log(err);
});
function get_username(token) {
    var decoded = null;
    try {
        decoded = jwt.verify(token, secret_key);
    }
    catch (e) {
        console.log("jwt -- failed to decode token, invalid secret_key");
        console.log(e);
        return null;
    }
    return decoded.username;
}
app.post('/create_transaction', function (req, res) {
    var transaction = req.body.transaction;
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    pool.query('INSERT INTO transactions (name, date, tags, username, value, is_inflow) VALUES ($1, $2, $3, $4, $5, $6)', [transaction.name, new Date(transaction.date), transaction.tags, username, transaction.value, transaction.is_inflow], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.send("created transaction successfully!");
        }
    });
    pool.query('SELECT * FROM tags WHERE username = $1', [username], function (error, results) {
        if (error)
            console.log(error);
        else {
            var tags_that_dont_exist_1 = [];
            transaction.tags.forEach(function (tag) {
                var tag_exists = false;
                results.rows.forEach(function (row, i) {
                    if (tag == row.value) {
                        tag_exists = true;
                    }
                });
                if (!tag_exists) {
                    tags_that_dont_exist_1.push(tag);
                }
            });
            tags_that_dont_exist_1.forEach(function (tag) {
                pool.query('INSERT INTO tags (value, username) VALUES ($1, $2)', [tag, username], function (error, results) {
                    if (error)
                        console.log(error);
                });
            });
        }
    });
});
app.post('/update_transaction', function (req, res) {
    console.log("Route -> /update_transaction");
    var transaction = req.body.transaction;
    console.log(transaction);
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    pool.query('UPDATE transactions SET name = $3, date = $4, tags = $5, value = $6, is_inflow = $7 WHERE username = $1 AND id = $2', [username, transaction.id, transaction.name, new Date(transaction.date), transaction.tags, transaction.value, transaction.is_inflow], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.send("updated transaction successfully");
        }
    });
    pool.query('SELECT * FROM tags WHERE username = $1', [username], function (error, results) {
        if (error)
            console.log(error);
        else {
            var tags_that_dont_exist_2 = [];
            transaction.tags.forEach(function (tag) {
                var tag_exists = false;
                results.rows.forEach(function (row, i) {
                    if (tag == row.value) {
                        tag_exists = true;
                    }
                });
                if (!tag_exists) {
                    tags_that_dont_exist_2.push(tag);
                }
            });
            tags_that_dont_exist_2.forEach(function (tag) {
                pool.query('INSERT INTO tags (value, username) VALUES ($1, $2)', [tag, username], function (error, results) {
                    if (error)
                        console.log(error);
                });
            });
        }
    });
});
app.get('/', function (req, res) {
    res.status(200).send("Hello from Budget Server!");
});
app.post('/register_user', function (req, res) {
    console.log('register user');
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    if (username.length == 0 || password.length == 0 || email.length == 0) {
        res.status(200).send({ message: "Error -- Field was empty." });
        return;
    }
    pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password], function (error, results) {
        if (error) {
            console.log(error.constraint);
            if (error.constraint == 'unique_email') {
                res.status(200).send({ message: 'Error -- Email has already been registered.' });
            }
            else if (error.constraint == 'unique_username') {
                res.status(200).send({ message: 'Error -- Username has already been registered.' });
            }
            else if (error.code == '23502') {
                res.status(200).send({ message: 'Error -- A field was left empty, please fill all fields!' });
            }
            else {
                res.status(200).send({ message: "Unknown error during registration" });
            }
        }
        else {
            var token = jwt.sign({ username: username }, secret_key);
            res.status(201).send({ message: "Registered user successfully!", token: token });
        }
    });
});
app.listen(port, "0.0.0.0", function () {
    console.log("Server is listening on port ".concat(port));
});
app.post('/login', function (req, res) {
    console.log('login route');
    var username = req.body.username;
    var password = req.body.password;
    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], function (error, results) {
        if (error) {
            console.log(error);
            res.status(401).send({ message: 'Failed to login' });
        }
        else {
            if (results.rowCount > 0) {
                var token = jwt.sign({ username: username }, secret_key);
                res.status(200).send({ message: "Logged in successfully!", token: token });
            }
            else {
                res.status(401).send({ message: 'Failed to login' });
            }
        }
    });
});
app.post('/validate_token', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, username;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('attempting to validate token');
                token = req.body.token;
                if (!token) {
                    res.status(200).send({ valid_token: false, username: null });
                    return [2];
                }
                username = get_username(req.body.token);
                if (!username) {
                    res.status(401).send({ message: "Error -- Invalid token." });
                    return [2];
                }
                return [4, pool.query('SELECT * FROM users WHERE username = $1', [username], function (error, results) {
                        if (error)
                            console.log(error);
                        else {
                            if (results.rowCount > 0) {
                                if (results.rows[0].username == username) {
                                    res.status(200).send({ valid_token: true, username: username });
                                }
                            }
                            else {
                                res.status(200).send({ valid_token: false, username: null });
                            }
                        }
                    })];
            case 1:
                _a.sent();
                return [2];
        }
    });
}); });
app.post('/delete_transaction', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var transaction_id, username, transaction_query, transaction_data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("delete_transaction route");
                    transaction_id = req.body.transaction_id;
                    username = get_username(req.body.token);
                    if (!username) {
                        res.status(401).send({ message: "Error -- Invalid token." });
                        return [2];
                    }
                    return [4, pool.query('SELECT * FROM transactions WHERE username = $1 AND id = $2', [username, transaction_id])];
                case 1:
                    transaction_query = _a.sent();
                    transaction_data = transaction_query.rows[0];
                    pool.query('DELETE FROM transactions WHERE username = $1 AND name = $2 AND id = $3', [username, transaction_data.name, transaction_data.id], function (error, results) {
                        if (error)
                            console.log(error);
                        else {
                            console.log('deleted transaction successfully!');
                            res.send("deleted transaction successfully!");
                        }
                    });
                    return [2];
            }
        });
    });
});
app.post('/get_transactions', function (req, res) {
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    pool.query('SELECT * FROM transactions WHERE username = $1', [username], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    });
});
app.post('/get_time_period_data', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var username, time_period, date, start, end, year, month, days_in_month, query_resp, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Route -> /get_time_period_data");
                    username = get_username(req.body.token);
                    if (!username) {
                        res.status(401).send({ message: "Error -- Invalid token." });
                        return [2];
                    }
                    time_period = req.body.time_period;
                    date = new Date(req.body.date);
                    start = null;
                    end = null;
                    if (time_period == 0) {
                        console.log("time_period: day");
                        start = new Date();
                        end = new Date();
                    }
                    else if (time_period == 1) {
                        console.log("time_period: week");
                        start = start_of_week(date);
                        end = end_of_week(date);
                    }
                    else if (time_period == 2) {
                        console.log("time_period: month");
                        year = date.getFullYear();
                        month = date.getMonth();
                        days_in_month = new Date(year, month, 0).getDate() + 1;
                        start = new Date(year, month);
                        end = new Date(year, month, days_in_month);
                    }
                    else if (time_period == 3) {
                        console.log("time_period: year");
                        start = (0, date_fns_1.startOfYear)(date);
                        end = (0, date_fns_1.endOfYear)(date);
                    }
                    if (!start || !end) {
                        res.status(200).send("Blah");
                        return [2];
                    }
                    return [4, pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end])];
                case 1:
                    query_resp = _a.sent();
                    data = { num_transactions: query_resp.rowCount, expenses: 0, income: 0 };
                    query_resp.rows.forEach(function (row) {
                        if (!row.is_inflow) {
                            data.expenses += row.value;
                        }
                        else {
                            data.income += row.value;
                        }
                    });
                    res.status(200).send(data);
                    return [2];
            }
        });
    });
});
app.post('/get_year_data', function (req, res) {
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    var date = new Date();
    var first_day_of_year = (0, date_fns_1.startOfYear)(date);
    var last_day_of_year = (0, date_fns_1.endOfYear)(date);
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, first_day_of_year, last_day_of_year], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    });
});
app.post('/get_month_data', function (req, res) {
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    console.log("month data");
    console.log(req.body.date);
    var date = null;
    if (req.body.date) {
        date = new Date(req.body.date);
    }
    else {
        date = new Date();
    }
    console.log(date);
    var year = date.getFullYear();
    var month = date.getMonth();
    var days_in_month = new Date(year, month, 0).getDate() + 1;
    var start = new Date(year, month);
    var end = new Date(year, month, days_in_month);
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    });
});
app.post('/get_week_data', function (req, res) {
    console.log("get_week_data route");
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    var date = new Date(req.body.date);
    var first_day = start_of_week(date);
    var last_day = end_of_week(date);
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, first_day, last_day], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    });
});
app.post('/get_day_data', function (req, res) {
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    var date = new Date;
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date = $2', [username, date], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    });
});
app.post('/get_transaction_numbers_data', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var username, date, year, month, days_in_month, month_start, month_end, first_day_week, last_day_week, transactions, rows, num_month_transactions, num_week_transactions, num_day_transactions, i, t_date;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    username = get_username(req.body.token);
                    if (!username) {
                        res.status(401).send({ message: "Error -- Invalid token." });
                        return [2];
                    }
                    date = new Date();
                    year = date.getFullYear();
                    month = date.getMonth();
                    days_in_month = new Date(year, month, 0).getDate() + 1;
                    month_start = new Date(year, month);
                    month_end = new Date(year, month, days_in_month);
                    first_day_week = start_of_week(date);
                    last_day_week = end_of_week(date);
                    console.log("month_start " + month_start);
                    console.log("month_end " + month_end);
                    console.log("first_day_week " + first_day_week);
                    console.log("last_day_week " + last_day_week);
                    return [4, pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, month_start, month_end])];
                case 1:
                    transactions = _a.sent();
                    rows = transactions.rows;
                    num_month_transactions = 0;
                    num_week_transactions = 0;
                    num_day_transactions = 0;
                    for (i = 0; i < rows.length; i++) {
                        t_date = new Date(rows[i].date);
                        if (t_date > month_start)
                            num_month_transactions++;
                        if (t_date >= first_day_week && t_date <= last_day_week)
                            num_week_transactions++;
                        if (is_same_day(t_date, date))
                            num_day_transactions++;
                    }
                    console.log("num_month_transactions: " + num_month_transactions);
                    console.log("num_week_transactions: " + num_week_transactions);
                    console.log("num_day_transactions: " + num_day_transactions);
                    res.status(200).send({
                        num_month_transactions: num_month_transactions,
                        num_week_transactions: num_week_transactions,
                        num_day_transactions: num_day_transactions
                    });
                    return [2];
            }
        });
    });
});
app.post('/get_tags', function (req, res) {
    console.log("get_tags route");
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    pool.query('SELECT * FROM tags WHERE username = $1', [username], function (error, results) {
        if (error)
            console.log(error);
        else {
            res.status(200).send({ tags: results.rows });
        }
    });
});
app.post('/get_popular_tags', function (req, res) {
    console.log("get_popular_tags route");
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    pool.query('SELECT * FROM transactions WHERE username = $1', [username], function (error, results) {
        if (error)
            console.log(error);
        else {
            ;
            var popular_tags_1 = [];
            for (var i = 0; i < results.rows.length; i++) {
                var transaction = results.rows[i];
                transaction.tags.forEach(function (transaction_tag) {
                    var matched = false;
                    popular_tags_1.forEach(function (pop_tag) {
                        if (pop_tag.value == transaction_tag) {
                            matched = true;
                            pop_tag.count++;
                        }
                    });
                    if (!matched) {
                        var new_pop_tag = {
                            value: transaction_tag,
                            count: 1
                        };
                        popular_tags_1.push(new_pop_tag);
                    }
                });
            }
            popular_tags_1.sort(function (a, b) { return b.count - a.count; });
            res.status(200).send({ popular_tags: popular_tags_1 });
        }
    });
});
app.post('/get_amount_spent_by_tags', function (req, res) {
    console.log("get_amount_spent_by_tags route");
    var username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    var time_period = req.body.time_period;
    var date = new Date(req.body.date);
    var start = null;
    var end = null;
    if (time_period == Time_Period.WEEK) {
        start = (0, date_fns_1.startOfWeek)(date);
        end = (0, date_fns_1.endOfWeek)(date);
    }
    else if (time_period == Time_Period.MONTH) {
        start = (0, date_fns_1.startOfMonth)(date);
        end = (0, date_fns_1.endOfMonth)(date);
    }
    console.assert(start && end);
    console.log("start: " + start);
    console.log("end: " + end);
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end], function (error, results) {
        if (error)
            console.log(error);
        else {
            var spending_tags_1 = [];
            var _loop_1 = function (i) {
                var transaction = results.rows[i];
                transaction.tags.forEach(function (transaction_tag) {
                    var matched = false;
                    spending_tags_1.forEach(function (spending_tag) {
                        if (spending_tag.name == transaction_tag) {
                            spending_tag.amount += transaction.value;
                            matched = true;
                        }
                    });
                    if (!matched) {
                        var new_spending_tag = {
                            name: transaction_tag,
                            amount: transaction.value
                        };
                        spending_tags_1.push(new_spending_tag);
                    }
                });
            };
            for (var i = 0; i < results.rows.length; i++) {
                _loop_1(i);
            }
            spending_tags_1.sort(function (a, b) { return b.amount - a.amount; });
            res.status(200).send({ spending_tags: spending_tags_1 });
        }
    });
});
app.post('/get_transactions_by_time_period', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var username, time_period, date, start, end, year, month, days_in_month, query_resp, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Route -> /get_transactions_by_time_period");
                    username = get_username(req.body.token);
                    if (!username) {
                        res.status(401).send({ message: "Error -- Invalid token." });
                        return [2];
                    }
                    time_period = req.body.time_period;
                    date = new Date(req.body.date);
                    start = null;
                    end = null;
                    if (time_period == 0) {
                        console.log("time_period: day");
                        start = new Date();
                        end = new Date();
                    }
                    else if (time_period == 1) {
                        console.log("time_period: week");
                        start = start_of_week(date);
                        end = end_of_week(date);
                    }
                    else if (time_period == 2) {
                        console.log("time_period: month");
                        year = date.getFullYear();
                        month = date.getMonth();
                        days_in_month = new Date(year, month, 0).getDate() + 1;
                        start = new Date(year, month);
                        end = new Date(year, month, days_in_month);
                    }
                    else if (time_period == 3) {
                        console.log("time_period: year");
                        start = (0, date_fns_1.startOfYear)(date);
                        end = (0, date_fns_1.endOfYear)(date);
                    }
                    if (!start || !end) {
                        res.status(200).send("Blah");
                        return [2];
                    }
                    return [4, pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end])];
                case 1:
                    query_resp = _a.sent();
                    data = { transactions: query_resp.rows };
                    res.status(200).send(data);
                    return [2];
            }
        });
    });
});
//# sourceMappingURL=index.js.map