import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";
import { startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";

export async function get_time_period_data(req: any, res: any) {
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

    const data = {num_transactions: query_resp.rowCount, expenses: 0, income: 0};
    
    query_resp.rows.forEach(row => {
        if (!row.is_inflow) {
            data.expenses += row.value;
        } else {
            data.income += row.value;
        }
    });

    res.status(200).send(data);
}