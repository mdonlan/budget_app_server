import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";

export async function delete_transaction(req: any, res: any) {
    console.log("delete_transaction route");
    const transaction_id = req.body.transaction_id;
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const transaction_query = await pool.query('SELECT * FROM transactions WHERE username = $1 AND id = $2', [username, transaction_id]);
    const transaction_data = transaction_query.rows[0];

    pool.query('DELETE FROM transactions WHERE username = $1 AND name = $2 AND id = $3', [username, transaction_data.name, transaction_data.id], (error: any, results: QueryResult) => {
        if (error) console.log(error);
        else {
            console.log('deleted transaction successfully!');
            res.send("deleted transaction successfully!")
        }
    })
}