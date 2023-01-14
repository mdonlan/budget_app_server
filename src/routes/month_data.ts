import { startOfMonth, endOfMonth } from 'date-fns';
import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";

export async function month_data(req: any, res: any) {
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
    // const year = date.getFullYear();
    // const month = date.getMonth();
    // const days_in_month = new Date(year, month, 0).getDate() + 1;
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
}
