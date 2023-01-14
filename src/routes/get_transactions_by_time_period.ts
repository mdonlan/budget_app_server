import { startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { get_username } from "..";
import { QueryResult } from 'pg';
import { pool } from "../db";

export async function get_transactions_by_time_period(req: any, res: any) {
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
        
        start = startOfWeek(date);
        end = endOfWeek(date);
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
}
