import { get_username, secret_key } from "..";
import { pool } from "../db";
import { QueryResult, DatabaseError } from "pg";
const jwt = require('jsonwebtoken');

export function register_user(req: any, res: any) {
    console.log('register user')

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    if (username.length == 0 || password.length == 0 || email.length == 0) {
        res.status(200).send({ message: "Error -- Field was empty." });
        return;
    }

    pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password], (error: DatabaseError, results: QueryResult) => {
        if (error) {
            console.log(error.constraint)
            if (error.constraint == 'unique_email') {
                res.status(200).send({ message: 'Error -- Email has already been registered.' });
            } else if (error.constraint == 'unique_username') {
                res.status(200).send({ message: 'Error -- Username has already been registered.' });

            } else if (error.code == '23502') {
                res.status(200).send({ message: 'Error -- A field was left empty, please fill all fields!' });
            } else {
                res.status(200).send({ message: "Unknown error during registration" });
            }
        } else {
            const token = jwt.sign({ username: username }, secret_key);
            res.status(201).send({ message: `Registered user successfully!`, token: token });
        }
    })
}