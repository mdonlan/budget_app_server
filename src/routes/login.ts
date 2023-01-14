import { get_username, secret_key } from "..";
import { pool } from "../db";
import { QueryResult, DatabaseError } from "pg";
const jwt = require('jsonwebtoken');

export function login(req: any, res: any) {
    console.log('login route');

    const username = req.body.username;
    const password = req.body.password;

    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error: any, results: QueryResult) => {
        if (error) {
            console.log(error);
            res.status(401).send({ message: 'Failed to login' })
        } else {
            if (results.rowCount > 0) {
                const token = jwt.sign({ username: username }, secret_key);
                res.status(200).send({ message: `Logged in successfully!`, token: token });
            } else {
                res.status(401).send({ message: 'Failed to login' })
            }
        }
    })
}