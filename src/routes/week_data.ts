import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";
import { startOfWeek, endOfWeek } from "date-fns";

export async function week_data(req: any, res: any) {
    console.log("get_week_data route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const date = new Date(req.body.date);
    const first_day = startOfWeek(date);
    const last_day = endOfWeek(date);

    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, first_day, last_day], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else { res.status(200).send({ transactions: results.rows }); }
    })
}