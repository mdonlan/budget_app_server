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

app.post('/create_transaction', (req, res) => {
  const date = new Date();
  const transaction = req.body.transaction;
  const username = jwt.decode(req.body.token, 'private_key').username;

	pool.query('INSERT INTO transactions (name, date, tags, username, value) VALUES ($1, $2, $3, $4, $5)', [transaction.name, date, transaction.tags, username, transaction.value], (error, results) => {
    if (error) console.log(error);
      else {
        res.send("created transaction successfully!")
    }
	})
})

// async function get_user_transactions() {
// 	const results = await pool.query('SELECT * FROM transactions');
// 	// console.log(results.rows);
// 	return results.rows;
// }

app.post('/register_user', function(req, res) {
  console.log('register user')
//   console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  if (username.length == 0 || password.length == 0 || email.length == 0) {
    res.status(200).send({ message: "Error -- Field was empty."});
    return;
  }

  // check to make sure username is unique
  // const users_with_name = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  // if (users_with_name.rows.length > 0) {
  //   res.status(200).send('Error -- Username is already taken.')
  // }

  pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password], (error, results) => {
      if (error) {
          // console.log(error);
          console.log(error.constraint)
          if (error.constraint == 'unique_email') {
              res.status(200).send({ message: 'Error -- Email has already been registered.' });
          } else if (error.constraint == 'unique_username') {
              res.status(200).send({ message: 'Error -- Username has already been registered.' });
              
          } else if (error.code == '23502') {
              res.status(200).send({ message: 'Error -- A field was left empty, please fill all fields!'});
          }  else {
              res.status(200).send({ message: "Unknown error during registration"});
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
//   console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;
//   console.log(username, password)

  

  pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error, results) => {
    if (error) {
        console.log(error);
        res.status(401).send({message: 'Failed to login'})
    } else {
        // console.log("row_count: " + results.rowCount);
        // console.log("rows: \n", results.rows);
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

app.post('/validate_token', async (req, res) => {
  console.log('attempting to validate token')

    const token = req.body.token;
    if (!token) {
        res.status(200).send({ valid_token: false, username: null });
        return;
    }

    // if there was a token, check it
    const decoded = jwt.verify(req.body.token, 'private_key');
  
    await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username], (error, results) => {
        if (error) console.log(error);
        else {
            if (results.rowCount > 0) {
                if (results.rows[0].username == decoded.username) {
                    res.status(200).send({ valid_token: true, username: decoded.username });
                }
            } else {
                res.status(200).send({ valid_token: false, username: null });
            }
        }
    })
})
app.post('/delete_transaction', async function(req, res) {
  if (!req.body.token) {
		res.send('no username');
		return;
	}

    /*
        delete_transaction
        1. find the transaction by its name/id in the db
        2. get the transaction amount and its category
        3. delete the transaction in db
        4. update the category amount to reverse the transaction
    */
	
    const transaction_id = req.body.transaction_id;
    const username = jwt.decode(req.body.token, 'private_key').username;
    
    const transaction_query = await pool.query('SELECT * FROM transactions WHERE username = $1 AND id = $2', [username, transaction_id]);
    const transaction_data = transaction_query.rows[0];

    console.log('transaction_data')
    console.log(transaction_data)

    const transaction_amount = parseFloat(transaction_data.amount);
    const transaction_category = transaction_data.category;

    const category_name = transaction_data.category;
	const category_data = await pool.query('SELECT * FROM categories WHERE username = $1 AND name = $2', [username, category_name]);
	const current_category_amount = parseFloat(category_data.rows[0].current_amount);
	const new_category_amount = current_category_amount - transaction_amount;

    pool.query('DELETE FROM transactions WHERE username = $1 AND name = $2 AND id = $3', [username, transaction_data.name, transaction_data.id], (error, results) => {
        if (error) console.log(error);
        else {
            console.log('deleted transaction successfully!');
            res.send("deleted transaction successfully!")
        }
    })

    pool.query('UPDATE categories SET current_amount = $1 WHERE username = $2 AND name = $3', [new_category_amount, username, category_name], (error, results) => {
		if (error) console.log(error);
		else console.log('updated the associated category amount')
	})

})

app.post('/get_transactions', function(req, res) {
    const decoded = jwt.verify(req.body.token, 'private_key');

    pool.query('SELECT * FROM transactions WHERE username = $1', [decoded.username], (error, results) => {
        if (error) console.log(error);
        else {
            res.status(200).send({ transactions: results.rows });
        }
    })
})