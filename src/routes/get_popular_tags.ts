import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Spending_Tag, Time_Period, get_username, Transaction } from "..";
import { Client, DatabaseError, QueryResult } from 'pg';
import { pool } from "../db";

export function get_popular_tags(req: any, res: any) {
    console.log("get_popular_tags route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    pool.query('SELECT * FROM transactions WHERE username = $1', [username], (error: DatabaseError, results: QueryResult) => {
        if (error) console.log(error);
        else {
            interface Popular_Tag {
                value: string;
                count: number;
            };
            const popular_tags: Popular_Tag[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const transaction = results.rows[i];
                
                transaction.tags.forEach((transaction_tag: string) => {
                    let matched = false;
                    popular_tags.forEach(pop_tag => {
                        if (pop_tag.value == transaction_tag) {
                            matched = true;
                            pop_tag.count++;
                        }
                    });

                    if (!matched) {
                        const new_pop_tag = {
                            value: transaction_tag,
                            count: 1
                        };
                        popular_tags.push(new_pop_tag);
                    }
                });
            }
            
            popular_tags.sort((a, b) => {return b.count - a.count});

            res.status(200).send({ popular_tags: popular_tags });
        }
    })
}
