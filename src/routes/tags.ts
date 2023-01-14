import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";

export async function tags(req: any, res: any) {
    console.log("get_tags route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('SELECT * FROM tags WHERE username = $1', [username], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ tags: results.rows });
        }
    })
}