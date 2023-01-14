import { get_username, secret_key } from "..";
import { pool } from "../db";
import { QueryResult, DatabaseError } from "pg";
const jwt = require('jsonwebtoken');
import { startOfWeek, endOfWeek, isSameDay } from "date-fns";

export async function transaction_numbers_data(req: any, res: any) {
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
    
    const first_day_week = startOfWeek(date);
    const last_day_week = endOfWeek(date);

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

        if (isSameDay(t_date, date)) num_day_transactions++;
    }

    console.log("num_month_transactions: " + num_month_transactions);
    console.log("num_week_transactions: " + num_week_transactions);
    console.log("num_day_transactions: " + num_day_transactions);

    res.status(200).send({ 
        num_month_transactions: num_month_transactions,
        num_week_transactions: num_week_transactions,
        num_day_transactions: num_day_transactions
     }); 
}

