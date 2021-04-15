const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const superagent = require('superagent');
const { Client } = require('pg')
const Pool = require('pg').Pool;
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'budget_app',
  password: 'password',
  // port: 5432,
})

app.get('/', async (req, res) => {
	console.log('root request')
	res.send(await get_user_transactions());
})

app.post('/create_transaction', async (req, res) => {
	console.log('create transaction')
	// console.log(req)
	console.log(req.body)

  const transaction = req.body.transaction;
  const date = new Date();
  const username = jwt.decode(req.body.token, 'private_key');

  pool.query('INSERT INTO transactions (name, date, amount, type, note, category, username) VALUES ($1, $2, $3, $4, $5, $6, $7)', [transaction.name, date, transaction.amount, transaction.type, transaction.note, transaction.category, username], (error, results) => {
    if (error) {
        console.log(error);
    } else {
      console.log('created new transaction');
    }
})
})

async function get_user_transactions() {
	const results = await pool.query('SELECT * FROM transactions');
	// console.log(results.rows);
	return results.rows;
}

app.post('/register_user', function(req, res) {
  console.log('register user')
  console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password], (error, results) => {
      if (error) {
          console.log(error);
          if (error.constraint == 'unique_email') {
              res.status(422).send('Error -- Email has already been registered');
          } else if (error.constraint == 'unique_username') {
              res.status(422).send('Error -- Username has already been registered');
              
          } else if (error.code == '23502') {
              res.status(422).send('Error -- A field was left empty, please fill all fields!');
          }  else {
              res.status(400).send("Unknown error during registration");
          }
      } else {
          // console.log(results);
          const token = jwt.sign({ username: username }, 'private_key');
          res.status(201).send({ message: `Registered user successfully!`, token: token });
      }
  })
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
})

app.post('/login', function(req, res) {
  console.log('login')
  console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;
  console.log(username, password)

  pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error, results) => {
    if (error) {
        console.log(error);
    } else {
        console.log("row_count: " + results.rowCount);
        console.log("rows: \n", results.rows);
        if (results.rowCount > 0) {
          // res.status(200).send({valid_token: valid_login, username: })
          const token = jwt.sign({ username: username }, 'private_key');
          res.status(200).send({ message: `Logged in successfully!`, token: token });
        } else {
          res.status(401).send({message: 'Failed to login'})
        }
        // if (results.rows[0].username == decoded.username) {
            // res.status(200).send({ valid_token: true, username: decoded.username });
        // }
        // res.status(200).json(results.rows);
    }
})

  // pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [req.body.email, req.body.username, req.body.password], (error, results) => {
  //     if (error) {
  //         console.log(error);
  //         if (error.constraint == 'unique_email') {
  //             res.status(422).send('Error -- Email has already been registered');
  //         } else if (error.constraint == 'unique_username') {
  //             res.status(422).send('Error -- Username has already been registered');
              
  //         } else if (error.code == '23502') {
  //             res.status(422).send('Error -- A field was left empty, please fill all fields!');
  //         }  else {
  //             res.status(400).send("Unknown error during registration");
  //         }
  //     } else {
  //         // console.log(results);
  //         const token = jwt.sign({ username: req.body.username }, 'private_key');
  //         res.status(201).send({ message: `Registered user successfully!`, token: token });
  //     }
  // })
})

app.post('/validate_token', function(req, res) {
  console.log('attempting to validate token')
  console.log(req.body);

  const decoded = jwt.verify(req.body.token, 'private_key');
  console.log(decoded)

  pool.query('SELECT * FROM users WHERE username = $1', [decoded.username], (error, results) => {
      if (error) {
          console.log(error);
      } else {
          // console.log(results);
          if (results.rowCount > 0) {
            if (results.rows[0].username == decoded.username) {
              res.status(200).send({ valid_token: true, username: decoded.username });
            }
          }
          
          // res.status(200).json(results.rows);
      }
  })
})

app.post('/create_category', function(req, res) {
  console.log('attempting to create a new budget category');
  console.log(req.body)

  const decoded = jwt.verify(req.body.token, 'private_key');

  pool.query('INSERT INTO categories (name, type, username, current_amount, total_amount) VALUES ($1, $2, $3, $4, $5)', [req.body.category.name, req.body.category.type, decoded.username, req.body.category.current_amount, req.body.category.total_amount], (error, results) => {
    if (error) console.log(error);
    else {
      
    }
  })
    //     if (error) {
  // pool.query('SELECT * FROM categories WHERE username = $1', [decoded.username], (error, results) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
      
  //   }
  // })


})

app.post('/get_categories', function(req, res) {
  console.log('getting categories');
  console.log(req.body)
  
  const decoded = jwt.verify(req.body.token, 'private_key');

  pool.query('SELECT * FROM categories WHERE username = $1', [decoded.username], (error, results) => {
    if (error) console.log(error);
    else {
      console.log(results)
      res.status(200).send({ categories: results.rows });
    }
  })
 

})