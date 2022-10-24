const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const superagent = require('superagent');
const { Client } = require('pg')
const Pool = require('pg').Pool;
const jwt = require('jsonwebtoken');
const start_of_week = require('date-fns/startOfWeek');
const end_of_week = require('date-fns/endOfWeek');
const is_same_day = require('date-fns/isSameDay');
const addDays = require('date-fns/addDays')
import { endOfYear, parseISO, startOfDay, startOfYear } from 'date-fns';
// const start_of_week = require('date-fns/startOfWeek');

import { Request, Response, NextFunction } from 'express';
import { QueryResult } from 'pg';

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

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3001;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'budget_app',
    password: 'password',
    // port: 5432,
})

app.post('/create_transaction', (req: Request, res: Response) => {
    // const date = new Date();
    const transaction = req.body.transaction;
    const username = jwt.decode(req.body.token, 'private_key').username;

    // console.log("new transaction date");
    // console.log(transaction.date);
    // console.log("new transaction date formatted");
    // console.log(parseISO(transaction.date));

    // const date = new Date()
    // console.log()
    console.log("transaction date: " + new Date(transaction.date));
    // date.totime
    // const date = new Date('2018-09-01T16:01:36.386Z')
    // const timeZone = 'Europe/Berlin'
    // const zonedDate = utcToZonedTime(date, timeZone)

    pool.query('INSERT INTO transactions (name, date, tags, username, value) VALUES ($1, $2, $3, $4, $5)', [transaction.name, new Date(transaction.date), transaction.tags, username, transaction.value], (error: Error, results: QueryResult) => {
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
            console.log(results.rows)
            const tags_that_dont_exist: string[] = [];
            transaction.tags.forEach((tag: string) => {
                console.log("tag: " + tag);
                // console.log(results)
                let tag_exists = false;
                results.rows.forEach((row, i) => {
                    console.log(row.value);
                    if (tag == row.value) {
                        tag_exists = true;
                    }
                });

                if (!tag_exists) {
                    tags_that_dont_exist.push(tag);
                }
            });
            

            console.log(tags_that_dont_exist)
            tags_that_dont_exist.forEach(tag => {
                pool.query('INSERT INTO tags (value, username) VALUES ($1, $2)', [tag, username], (error: Error, results: QueryResult) => {
                    if (error) console.log(error);
                    else {
                        // res.send("added new tag successfully!")
                    }
                })
            });
        }
    })

    
})

// async function get_user_transactions() {
// 	const results = await pool.query('SELECT * FROM transactions');
// 	// console.log(results.rows);
// 	return results.rows;
// }

app.get('/', (req: Request, res: Response) => {
    res.status(200).send("Hello from Budget Server!");
});

app.post('/register_user', function (req: Request, res: Response) {
    console.log('register user')
    //   console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    if (username.length == 0 || password.length == 0 || email.length == 0) {
        res.status(200).send({ message: "Error -- Field was empty." });
        return;
    }

    // check to make sure username is unique
    // const users_with_name = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    // if (users_with_name.rows.length > 0) {
    //   res.status(200).send('Error -- Username is already taken.')
    // }

    pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password], (error: any, results: QueryResult) => {
        if (error) {
            // console.log(error);
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
            // console.log(results);
            const token = jwt.sign({ username: username }, 'private_key');
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
                const token = jwt.sign({ username: username }, 'private_key');
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

    // if there was a token, check it
    const decoded = jwt.verify(req.body.token, 'private_key');

    await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            if (results.rowCount > 0) {
                if (results.rows[0].username == decoded.username) {
                    res.status(200).send({ valid_token: true, username: decoded.username });
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
    const username = jwt.decode(req.body.token, 'private_key').username;

    const transaction_query = await pool.query('SELECT * FROM transactions WHERE username = $1 AND id = $2', [username, transaction_id]);
    const transaction_data = transaction_query.rows[0];

    // console.log('transaction_data')
    // console.log(transaction_data)

    const transaction_amount = parseFloat(transaction_data.amount);

    pool.query('DELETE FROM transactions WHERE username = $1 AND name = $2 AND id = $3', [username, transaction_data.name, transaction_data.id], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            console.log('deleted transaction successfully!');
            res.send("deleted transaction successfully!")
        }
    })
})

app.post('/get_transactions', function (req: Request, res: Response) {
    const decoded = jwt.verify(req.body.token, 'private_key');

    pool.query('SELECT * FROM transactions WHERE username = $1', [decoded.username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})

app.post('/get_time_period_data', async function (req: Request, res: Response) {
    console.log("Route -> /get_time_period_data");
    const decoded = jwt.verify(req.body.token, 'private_key');
    const time_period = req.body.time_period;

    const date = new Date();
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

    const query_resp: QueryResult = await pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [decoded.username, start, end]);
    console.log(query_resp.rows);

    const data = {num_transactions: query_resp.rowCount, money_spent: 0};
    
    query_resp.rows.forEach(row => {
        data.money_spent += row.value;
    });

    res.status(200).send(data);

    // const date = new Date();
    // const year = date.getFullYear();
    // const month = date.getMonth();
    // const days_in_month = new Date(year, month, 0).getDate() + 1;
    // const start = new Date(year, month);
    // const end = new Date(year, month, days_in_month);

    // pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [decoded.username, start, end], (error: any, results: QueryResult) => {
    //     if (error) console.log(error);
    //     else {
    //         res.status(200).send({ transactions: results.rows });
    //     }
    // })
})

app.post('/get_month_data', function (req: Request, res: Response) {
    const decoded = jwt.verify(req.body.token, 'private_key');

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days_in_month = new Date(year, month, 0).getDate() + 1;
    const start = new Date(year, month);
    const end = new Date(year, month, days_in_month);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [decoded.username, start, end], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})

app.post('/get_week_data', function (req: Request, res: Response) {
    console.log("get_week_data route");
    const decoded = jwt.verify(req.body.token, 'private_key');

    const date = new Date;
    const first_day = start_of_week(date);
    const last_day = end_of_week(date);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [decoded.username, first_day, last_day], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else { res.status(200).send({ transactions: results.rows }); }
    })
})

app.post('/get_day_data', function (req: Request, res: Response) {
    const decoded = jwt.verify(req.body.token, 'private_key');

    const date = new Date;
    // const first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
    // const last = first + 6; // last day is the first day + 6  

    // const first_day = new Date(date.setDate(first));
    // const last_day = new Date(date.setDate(last));
    // console.log("first: " + first_day);
    // console.log("last: " + last_day);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date = $2', [decoded.username, date], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})

app.post('/get_transaction_numbers_data', async function(req: Request, res: Response) {
    const username = jwt.verify(req.body.token, 'private_key').username;
  
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days_in_month = new Date(year, month, 0).getDate() + 1;
    const month_start = new Date(year, month);
    const month_end = new Date(year, month, days_in_month);

    const first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
    const last = first + 6; // last day is the first day + 6  

    // const first_day_week = new Date(date.setDate(first));
    // const last_day_week = new Date(date.setDate(last));
    
    const first_day_week = start_of_week(date);
    const last_day_week = end_of_week(date);

    console.log("month_start " + month_start)
    console.log("month_end " + month_end)
    console.log("first_day_week " + first_day_week)
    console.log("last_day_week " + last_day_week)


    const transactions = await pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, month_start, month_end]);
    // console.log(transactions.rows)
    const rows = transactions.rows;

    let num_month_transactions = 0;
    let num_week_transactions = 0;
    let num_day_transactions = 0;

    for (let i = 0; i < rows.length; i++) {
        const t_date = new Date(rows[i].date);
        console.log("t_date: " + t_date)
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
    const decoded = jwt.verify(req.body.token, 'private_key');

    pool.query('SELECT * FROM tags WHERE username = $1', [decoded.username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ tags: results.rows });
        }
    })
});

app.post('/get_popular_tags', function (req: Request, res: Response) {
    console.log("get_popular_tags route");
    const decoded = jwt.verify(req.body.token, 'private_key');

    pool.query('SELECT * FROM transactions WHERE username = $1', [decoded.username], (error: any, results: QueryResult) => {
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

            // console.log(popular_tags);
            res.status(200).send({ popular_tags: popular_tags });
        }
    })
});

app.post('/get_amount_spent_by_tags', function (req: Request, res: Response) {
    console.log("get_amount_spent_by_tags route");
    const decoded = jwt.verify(req.body.token, 'private_key');

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days_in_month = new Date(year, month, 0).getDate() + 1;
    const month_start = new Date(year, month);
    const month_end = new Date(year, month, days_in_month);

    // only get data for this month??
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [decoded.username, month_start, month_end], (error: any, results: QueryResult) => {
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

            if (spending_tags.length == 0) {
                
            }
              
            spending_tags.sort((a, b) => {return b.amount - a.amount});

            // console.log(spending_tags);
            res.status(200).send({ spending_tags: spending_tags });
        }
    })
});