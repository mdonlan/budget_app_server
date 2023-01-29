const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
import { Request, Response } from 'express';
import { get_amount_spent_by_tags } from './routes/get_amount_spent_by_tags';
import { get_popular_tags } from './routes/get_popular_tags';
import { get_transactions_by_time_period } from './routes/get_transactions_by_time_period';
import { create_transaction } from './routes/create_transaction';
import { update_transaction } from './routes/update_transaction';
import { register_user } from './routes/register_user';
import { login } from './routes/login';
import { validate_token } from './routes/validate_token';
import { delete_transaction } from './routes/delete_transaction';
import { get_transactions } from './routes/get_transactions';
import { get_time_period_data } from './routes/get_time_period_data';
import { day_data } from './routes/day_data';
import { transaction_numbers_data } from './routes/transaction_numbers_data';
import { tags } from './routes/tags';
import { year_data } from './routes/year_data';
import { month_data } from './routes/month_data';
import { week_data } from './routes/week_data';

// check /home/michael and base of project for .env files
require('dotenv').config({path:'/home/michael/.env'})
require('dotenv').config()

export const secret_key = process.env.JWT_SECRET_KEY;

export interface Spending_Tag {
    name: string;
    amount: number;
};

export interface Transaction {
    id: number;
    name: string;
    date: Date;
    tags: string[];
    value: number;
    username: string;
    is_inflow: boolean;
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

export function get_username(token: string) {
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

app.post('/create_transaction', create_transaction);
app.post('/update_transaction', update_transaction);
app.post('/register_user', register_user);
app.post('/login', login);
app.post('/validate_token', validate_token);
app.post('/delete_transaction', delete_transaction);
app.post('/get_transactions', get_transactions);
app.post('/get_time_period_data', get_time_period_data);
app.post('/get_popular_tags', get_popular_tags);
app.post('/get_amount_spent_by_tags', get_amount_spent_by_tags);
app.post('/get_transactions_by_time_period', get_transactions_by_time_period);
app.post('/get_day_data', day_data);
app.post('/get_transaction_numbers_data', transaction_numbers_data);
app.post('/get_tags', tags);
app.post('/get_year_data', year_data);
app.post('/get_month_data', month_data);
app.post('/get_week_data', week_data);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send("Hello from Budget Server!");
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}`);
})