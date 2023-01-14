import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";

export async function validate_token(req: any, res: any) {
    console.log('attempting to validate token')

    const token = req.body.token;
    if (!token) {
        res.status(200).send({ valid_token: false, username: null });
        return;
    }

    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    await pool.query('SELECT * FROM users WHERE username = $1', [username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            if (results.rowCount > 0) {
                if (results.rows[0].username == username) {
                    res.status(200).send({ valid_token: true, username: username });
                }
            } else {
                res.status(200).send({ valid_token: false, username: null });
            }
        }
    })
}