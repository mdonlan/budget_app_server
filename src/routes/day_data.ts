import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";

export async function day_data(req: any, res: any) {
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
}