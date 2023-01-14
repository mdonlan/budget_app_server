import { get_username } from "..";
import { pool } from "../db";
import { QueryResult, DatabaseError } from "pg";

export function get_transactions(req: any, res: any) {
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
}