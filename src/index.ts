const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const Pool = require('pg').Pool;
const jwt = require('jsonwebtoken');
const start_of_week = require('date-fns/startOfWeek');
const end_of_week = require('date-fns/endOfWeek');
const is_same_day = require('date-fns/isSameDay');
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { Request, Response } from 'express';
import { Client, DatabaseError, QueryResult } from 'pg';

// check /root and base of project for .env files
require('dotenv').config({path:'/home/michael/.env'})
require('dotenv').config()

const secret_key = process.env.JWT_SECRET_KEY;

var types = require('pg').types
types.setTypeParser(1700, function (val: string) {
    return parseFloat(val);
});

interface Spending_Tag {
    name: string;
    amount: number;
};

interface Transaction {
    id: number;
    name: string;
    date: Date;
    tags: string[];
    value: number;
    username: string;
};

export enum Time_Period {
    DAY,
    WEEK,
    MONTH,
    YEAR
}

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3001;

const pool = new Pool({
    user: 'postgres',
    password: process.env.PG_PASSWORD,
    host: 'localhost',
    database: 'budget_app',
})

pool.on('error', (err: Error, client: Client) => {
    console.log("POOL ERROR");
    console.log(err);
});

function get_username(token: string) {
    let decoded: any = null;
    try {
        decoded = jwt.verify(token, secret_key);
    } catch (e) {
        console.log("jwt -- failed to decode token, invalid secret_key");
        console.log(e);
        return null;
    }

    return decoded.username; 
}

app.post('/create_transaction', (req: Request, res: Response) => {
    const transaction = req.body.transaction;
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('INSERT INTO transactions (name, date, tags, username, value, is_inflow) VALUES ($1, $2, $3, $4, $5, $6)', 
        [transaction.name, new Date(transaction.date), transaction.tags, username, transaction.value, transaction.is_inflow], (error: Error, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.send("created transaction successfully!")
        }
    })

    // check tags against existing tags for user
    // if there are new tags then add them to the tags db
    pool.query('SELECT * FROM tags WHERE username = $1', [username], (error: Error, results: QueryResult) => {
        if (error) console.log(error);
        else {
            // console.log(results.rows)
            const tags_that_dont_exist: string[] = [];
            transaction.tags.forEach((tag: string) => {
                let tag_exists = false;
                results.rows.forEach((row, i) => {
                    if (tag == row.value) {
                        tag_exists = true;
                    }
                });

                if (!tag_exists) {
                    tags_that_dont_exist.push(tag);
                }
            });
            
            tags_that_dont_exist.forEach(tag => {
                pool.query('INSERT INTO tags (value, username) VALUES ($1, $2)', [tag, username], (error: Error, results: QueryResult) => {
                    if (error) console.log(error);
                })
            });
        }
    })    
})

app.post('/update_transaction', (req: Request, res: Response) => {
    console.log("Route -> /update_transaction");
    const transaction = req.body.transaction;
    console.log(transaction);
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('UPDATE transactions SET name = $3, date = $4, tags = $5, value = $6, is_inflow = $7 WHERE username = $1 AND id = $2', 
        [username, transaction.id, transaction.name, new Date(transaction.date), transaction.tags, transaction.value, transaction.is_inflow], (error: Error, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.send("updated transaction successfully");
        }
    })

    // pool.query('INSERT INTO transactions (name, date, tags, username, value) VALUES ($1, $2, $3, $4, $5)', [transaction.name, new Date(transaction.date), transaction.tags, username, transaction.value], (error: Error, results: QueryResult) => {
    //     if (error) console.log(error);
    //     else {
    //         res.send("created transaction successfully!")
    //     }
    // })

    // check tags against existing tags for user
    // if there are new tags then add them to the tags db
    pool.query('SELECT * FROM tags WHERE username = $1', [username], (error: Error, results: QueryResult) => {
        if (error) console.log(error);
        else {
            // console.log(results.rows)
            const tags_that_dont_exist: string[] = [];
            transaction.tags.forEach((tag: string) => {
                let tag_exists = false;
                results.rows.forEach((row, i) => {
                    if (tag == row.value) {
                        tag_exists = true;
                    }
                });

                if (!tag_exists) {
                    tags_that_dont_exist.push(tag);
                }
            });
            
            tags_that_dont_exist.forEach(tag => {
                pool.query('INSERT INTO tags (value, username) VALUES ($1, $2)', [tag, username], (error: Error, results: QueryResult) => {
                    if (error) console.log(error);
                })
            });
        }
    })    
})

app.get('/', (req: Request, res: Response) => {
    res.status(200).send("Hello from Budget Server!");
});

app.post('/register_user', function (req: Request, res: Response) {
    console.log('register user')

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    if (username.length == 0 || password.length == 0 || email.length == 0) {
        res.status(200).send({ message: "Error -- Field was empty." });
        return;
    }

    pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password], (error: DatabaseError, results: QueryResult) => {
        if (error) {
            console.log(error.constraint)
            if (error.constraint == 'unique_email') {
                res.status(200).send({ message: 'Error -- Email has already been registered.' });
            } else if (error.constraint == 'unique_username') {
                res.status(200).send({ message: 'Error -- Username has already been registered.' });

            } else if (error.code == '23502') {
                res.status(200).send({ message: 'Error -- A field was left empty, please fill all fields!' });
            } else {
                res.status(200).send({ message: "Unknown error during registration" });
            }
        } else {
            const token = jwt.sign({ username: username }, secret_key);
            res.status(201).send({ message: `Registered user successfully!`, token: token });
        }
    })
})

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}`);
})

app.post('/login', function (req: Request, res: Response) {
    console.log('login route');

    const username = req.body.username;
    const password = req.body.password;

    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error: any, results: QueryResult) => {
        if (error) {
            console.log(error);
            res.status(401).send({ message: 'Failed to login' })
        } else {
            if (results.rowCount > 0) {
                const token = jwt.sign({ username: username }, secret_key);
                res.status(200).send({ message: `Logged in successfully!`, token: token });
            } else {
                res.status(401).send({ message: 'Failed to login' })
            }
        }
    })
})

app.post('/validate_token', async (req: Request, res: Response) => {
    console.log('attempting to validate token')

    const token = req.body.token;
    if (!token) {
        res.status(200).send({ valid_token: false, username: null });
        return;
    }

    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    await pool.query('SELECT * FROM users WHERE username = $1', [username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            if (results.rowCount > 0) {
                if (results.rows[0].username == username) {
                    res.status(200).send({ valid_token: true, username: username });
                }
            } else {
                res.status(200).send({ valid_token: false, username: null });
            }
        }
    })
})
app.post('/delete_transaction', async function (req: Request, res: Response) {
    console.log("delete_transaction route");
    const transaction_id = req.body.transaction_id;
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const transaction_query = await pool.query('SELECT * FROM transactions WHERE username = $1 AND id = $2', [username, transaction_id]);
    const transaction_data = transaction_query.rows[0];

    pool.query('DELETE FROM transactions WHERE username = $1 AND name = $2 AND id = $3', [username, transaction_data.name, transaction_data.id], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            console.log('deleted transaction successfully!');
            res.send("deleted transaction successfully!")
        }
    })
})

app.post('/get_transactions', function (req: Request, res: Response) {
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('SELECT * FROM transactions WHERE username = $1', [username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})

app.post('/get_time_period_data', async function (req: Request, res: Response) {
    console.log("Route -> /get_time_period_data");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    const time_period = req.body.time_period;

    // console.log(req.body)

    const date = new Date(req.body.date);
    let start = null;
    let end = null;

    if (time_period == 0) {
        console.log("time_period: day");
        start = new Date();
        end = new Date();
        // addDays(start, 1);
    } else if (time_period == 1) {
        console.log("time_period: week");
        
        start = start_of_week(date);
        end = end_of_week(date);
    } else if (time_period == 2) {
        console.log("time_period: month");
        const year = date.getFullYear();
        const month = date.getMonth();
        const days_in_month = new Date(year, month, 0).getDate() + 1;
        start = new Date(year, month);
        end = new Date(year, month, days_in_month);
    }
    else if (time_period == 3) {
        console.log("time_period: year");
        start = startOfYear(date);
        end = endOfYear(date);
    }

    if (!start || !end) {
        res.status(200).send("Blah");
        return;
    }

    const query_resp: QueryResult = await pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end]);

    const data = {num_transactions: query_resp.rowCount, expenses: 0, income: 0};
    
    query_resp.rows.forEach(row => {
        if (!row.is_inflow) {
            data.expenses += row.value;
        } else {
            data.income += row.value;
        }
    });

    res.status(200).send(data);
})

app.post('/get_year_data', function (req: Request, res: Response) {
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const date = new Date();
    const first_day_of_year = startOfYear(date);
    const last_day_of_year = endOfYear(date);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, first_day_of_year, last_day_of_year], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})


app.post('/get_month_data', function (req: Request, res: Response) {
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    console.log("month data");
    console.log(req.body.date)

    // check if there is a data sent with the request
    // if so use that as the month, otherwise use the current month
    let date = null;
    if (req.body.date) {
        date = new Date(req.body.date);
    } else {
        date = new Date();
    }

    // const date = new Date();
    console.log(date)
    const year = date.getFullYear();
    const month = date.getMonth();
    const days_in_month = new Date(year, month, 0).getDate() + 1;
    const start = new Date(year, month);
    const end = new Date(year, month, days_in_month);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})

app.post('/get_week_data', function (req: Request, res: Response) {
    console.log("get_week_data route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const date = new Date(req.body.date);
    const first_day = start_of_week(date);
    const last_day = end_of_week(date);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, first_day, last_day], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else { res.status(200).send({ transactions: results.rows }); }
    })
})

app.post('/get_day_data', function (req: Request, res: Response) {
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const date = new Date;

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date = $2', [username, date], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})

app.post('/get_transaction_numbers_data', async function(req: Request, res: Response) {
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
  
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days_in_month = new Date(year, month, 0).getDate() + 1;
    const month_start = new Date(year, month);
    const month_end = new Date(year, month, days_in_month);
    
    const first_day_week = start_of_week(date);
    const last_day_week = end_of_week(date);

    console.log("month_start " + month_start)
    console.log("month_end " + month_end)
    console.log("first_day_week " + first_day_week)
    console.log("last_day_week " + last_day_week)


    const transactions = await pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, month_start, month_end]);
    const rows = transactions.rows;

    let num_month_transactions = 0;
    let num_week_transactions = 0;
    let num_day_transactions = 0;

    for (let i = 0; i < rows.length; i++) {
        const t_date = new Date(rows[i].date);
        if (t_date > month_start) num_month_transactions++;

        if (t_date >= first_day_week && t_date <= last_day_week) num_week_transactions++;

        if (is_same_day(t_date, date)) num_day_transactions++;
    }

    console.log("num_month_transactions: " + num_month_transactions);
    console.log("num_week_transactions: " + num_week_transactions);
    console.log("num_day_transactions: " + num_day_transactions);

    res.status(200).send({ 
        num_month_transactions: num_month_transactions,
        num_week_transactions: num_week_transactions,
        num_day_transactions: num_day_transactions
     }); 
  })

app.post('/get_tags', function (req: Request, res: Response) {
    console.log("get_tags route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('SELECT * FROM tags WHERE username = $1', [username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ tags: results.rows });
        }
    })
});

app.post('/get_popular_tags', function (req: Request, res: Response) {
    console.log("get_popular_tags route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('SELECT * FROM transactions WHERE username = $1', [username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            interface Popular_Tag {
                value: string;
                count: number;
            };
            const popular_tags: Popular_Tag[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const transaction = results.rows[i];
                
                transaction.tags.forEach((transaction_tag: string) => {
                    let matched = false;
                    popular_tags.forEach(pop_tag => {
                        if (pop_tag.value == transaction_tag) {
                            matched = true;
                            pop_tag.count++;
                        }
                    });

                    if (!matched) {
                        const new_pop_tag = {
                            value: transaction_tag,
                            count: 1
                        };
                        popular_tags.push(new_pop_tag);
                    }
                });
            }
              
            popular_tags.sort((a, b) => {return b.count - a.count});

            res.status(200).send({ popular_tags: popular_tags });
        }
    })
});

app.post('/get_amount_spent_by_tags', function (req: Request, res: Response) {
    console.log("get_amount_spent_by_tags route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const time_period = req.body.time_period;
    const date = new Date(req.body.date);
    let start = null;
    let end = null;

    if (time_period == Time_Period.WEEK) {
        start = startOfWeek(date);
        end = endOfWeek(date);
    } else if (time_period == Time_Period.MONTH) {
        start = startOfMonth(date);
        end = endOfMonth(date);
    }

    console.assert(start && end);
    console.log("start: " + start);
    console.log("end: " + end);

    // only get data for this month??
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            const spending_tags: Spending_Tag[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const transaction: Transaction = results.rows[i];

                transaction.tags.forEach((transaction_tag: string) => {
                    let matched = false;
                    spending_tags.forEach((spending_tag: Spending_Tag) => {
                        if (spending_tag.name == transaction_tag) {
                            spending_tag.amount += transaction.value;
                            matched = true;
                        }
                    });
                    
                    if (!matched) {
                        const new_spending_tag: Spending_Tag = {
                            name: transaction_tag,
                            amount: transaction.value
                        }
                        spending_tags.push(new_spending_tag);
                    }
                });
            }
              
            spending_tags.sort((a, b) => {return b.amount - a.amount});

            res.status(200).send({ spending_tags: spending_tags });
        }
    })
});

app.post('/get_transactions_by_time_period', async function (req: Request, res: Response) {
    console.log("Route -> /get_transactions_by_time_period");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }
    const time_period = req.body.time_period;

    const date = new Date(req.body.date);
    let start = null;
    let end = null;

    if (time_period == 0) {
        console.log("time_period: day");
        start = new Date();
        end = new Date();
        // addDays(start, 1);
    } else if (time_period == 1) {
        console.log("time_period: week");
        
        start = start_of_week(date);
        end = end_of_week(date);
    } else if (time_period == 2) {
        console.log("time_period: month");
        const year = date.getFullYear();
        const month = date.getMonth();
        const days_in_month = new Date(year, month, 0).getDate() + 1;
        start = new Date(year, month);
        end = new Date(year, month, days_in_month);
    }
    else if (time_period == 3) {
        console.log("time_period: year");
        start = startOfYear(date);
        end = endOfYear(date);
    }

    if (!start || !end) {
        res.status(200).send("Blah");
        return;
    }

    const query_resp: QueryResult = await pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end]);

    const data = {transactions: query_resp.rows};
    
    // query_resp.rows.forEach(row => {
    //     data.money_spent += row.value;
    // });

    res.status(200).send(data);
})