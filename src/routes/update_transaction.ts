import { get_username } from "..";
import { pool } from "../db";
import { QueryResult } from "pg";

export function update_transaction(req: any, res: any) {
    console.log("Route -> /update_transaction");
    const transaction = req.body.transaction;
    console.log(transaction);
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('UPDATE transactions SET name = $3, date = $4, tags = $5, value = $6, is_inflow = $7 WHERE username = $1 AND id = $2', 
        [username, transaction.id, transaction.name, new Date(transaction.date), transaction.tags, transaction.value, transaction.is_inflow], (error: Error, results: QueryResult) => {
        if (error) console.log(error);
        else {
            res.send("updated transaction successfully");
        }
    })

    // pool.query('INSERT INTO transactions (name, date, tags, username, value) VALUES ($1, $2, $3, $4, $5)', [transaction.name, new Date(transaction.date), transaction.tags, username, transaction.value], (error: Error, results: QueryResult) => {
    //     if (error) console.log(error);
    //     else {
    //         res.send("created transaction successfully!")
    //     }
    // })

    // check tags against existing tags for user
    // if there are new tags then add them to the tags db
    pool.query('SELECT * FROM tags WHERE username = $1', [username], (error: Error, results: QueryResult) => {
        if (error) console.log(error);
        else {
            // console.log(results.rows)
            const tags_that_dont_exist: string[] = [];
            transaction.tags.forEach((tag: string) => {
                let tag_exists = false;
                results.rows.forEach((row, i) => {
                    if (tag == row.value) {
                        tag_exists = true;
                    }
                });

                if (!tag_exists) {
                    tags_that_dont_exist.push(tag);
                }
            });
            
            tags_that_dont_exist.forEach(tag => {
                pool.query('INSERT INTO tags (value, username) VALUES ($1, $2)', [tag, username], (error: Error, results: QueryResult) => {
                    if (error) console.log(error);
                })
            });
        }
    })
}