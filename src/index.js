const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const superagent = require('superagent');
const { Client } = require('pg')
const Pool = require('pg').Pool;

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;


// const client = new Client()
// await client.connect()
// const res = await client.query('SELECT $1::text as message', ['Hello world!'])
// console.log(res.rows[0].message) // Hello world!
// await client.end()

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'budget_app',
  password: 'password',
  port: 5432,
})

// const name = "test transactions 01";
// pool.query('INSERT INTO transactions (Name) VALUES ($1)', [name], (error, results) => {
//     if (error) {
//         throw error
//     }
//     console.log("inserted new transaction");
// })

// pool.query('SELECT * FROM legislators', (error, results) => {
//     if (error) {
//       throw error
//     }
//     console.log(results.rows)
//   })
// const name = "blah blah";
// pool.query('INSERT INTO legislators (Name) VALUES ($1)', [name], (error, results) => {
//     if (error) {
//         throw error
//     }
//     console.log("inserted new legislator");
//     // response.status(201).send(`User added with ID: ${result.insertId}`)
// })

// async function get_legislators() {
//     try {
//         const queryArguments = {
//             apikey: '22691594f640230fd8ca371699406559',
//             output: 'json'
//         }
    
//         const response = await superagent.get('https://www.opensecrets.org/api/?method=getLegislators&id=ME').query(queryArguments)
//         const json = JSON.parse(response.text);

//         console.log(json.response.legislator)

//         console.log('\n\n\n');

//         console.log(json.response.legislator["@attributes"])

//         // pool.query('INSERT INTO legislators (Name) VALUES ($1)', [response.text], (error, results) => {
//         //     if (error) {
//         //         throw error
//         //     }
//         //     console.log("inserted new legislator");
//         //     // response.status(201).send(`User added with ID: ${result.insertId}`)
//         // })
        
//     } catch (error) {
//         console.log(error);
//     }
// }


app.get('/', async (req, res) => {
	console.log('root request')
	res.send(await get_user_transactions());
})

app.post('/create_transaction', async (req, res) => {
	console.log('create transaction')
	// console.log(req)
	console.log(req.body)
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
})

async function get_user_transactions() {
	const results = await pool.query('SELECT * FROM transactions');
	// console.log(results.rows);
	return results.rows;
}

/*
axios.get('https://www.opensecrets.org/api/?method=getLegislators&id=NJ&apikey=22691594f640230fd8ca371699406559')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
*/