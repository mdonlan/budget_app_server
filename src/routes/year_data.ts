import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";
import { startOfYear, endOfYear } from "date-fns";

export async function year_data(req: any, res: any) {
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
}
