const Pool = require('pg').Pool;
import { Client, DatabaseError, QueryResult } from 'pg';

// check /home/michael and base of project for .env files
require('dotenv').config({path:'/home/michael/.env'})
require('dotenv').config()

const types = require('pg').types
types.setTypeParser(1700, function (val: string) {
    return parseFloat(val);
});

export const pool = new Pool({
    user: 'postgres',
    password: process.env.PG_PASSWORD,
    host: 'localhost',
    database: 'budget_app',
});


pool.on('error', (err: Error, client: Client) => {
    console.log("POOL ERROR");
    console.log(err);
});