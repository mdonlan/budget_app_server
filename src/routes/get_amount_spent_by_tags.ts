import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Spending_Tag, Time_Period, get_username, Transaction } from "..";
import { Client, DatabaseError, QueryResult } from 'pg';
import { pool } from "../db";

export function get_amount_spent_by_tags(req: any, res: any) {
    console.log("get_amount_spent_by_tags route");
    const username = get_username(req.body.token);
    if (!username) {
        res.status(401).send({ message: "Error -- Invalid token." });
        return;
    }

    const time_period = req.body.time_period;
    const date = new Date(req.body.date);
    let start = null;
    let end = null;

    if (time_period == Time_Period.WEEK) {
        start = startOfWeek(date);
        end = endOfWeek(date);
    } else if (time_period == Time_Period.MONTH) {
        start = startOfMonth(date);
        end = endOfMonth(date);
    }

    console.assert(start && end);
    console.log("start: " + start);
    console.log("end: " + end);

    // only get data for this month??
    pool.query('SELECT * FROM transactions WHERE username = $1 AND date BETWEEN $2 AND $3', [username, start, end], (error: DatabaseError, results: QueryResult) => {
        if (error) console.log(error);
        else {
            const spending_tags: Spending_Tag[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const transaction: Transaction = results.rows[i];

                if (transaction.is_inflow) continue;

                transaction.tags.forEach((transaction_tag: string) => {
                    let matched = false;
                    spending_tags.forEach((spending_tag: Spending_Tag) => {
                        if (spending_tag.name == transaction_tag) {
                            spending_tag.amount += transaction.value;
                            matched = true;
                        }
                    });
                    
                    if (!matched) {
                        const new_spending_tag: Spending_Tag = {
                            name: transaction_tag,
                            amount: transaction.value
                        }
                        spending_tags.push(new_spending_tag);
                    }
                });
            }
              
            spending_tags.sort((a, b) => {return b.amount - a.amount});

            res.status(200).send({ spending_tags: spending_tags });
        }
    })
}