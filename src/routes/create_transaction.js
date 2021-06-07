const jwt = require('jsonwebtoken');

module.exports = async function create_transaction(req, res, pool) {
    console.log('start of create transaction')
	
	if (!req.body.token) {
		res.send('no username');
		return;
	}
	
	const date = new Date();
  	const transaction = req.body.transaction;
  	const username = jwt.decode(req.body.token, 'private_key').username;

	const account_info = await pool.query('SELECT * FROM accounts WHERE username = $1 AND name = $2', [username, transaction.account]);
	const account_name = account_info.rows[0].name;
	
	let value = parseInt(transaction.amount);
	if (transaction.type == "Outflow") value *= -1;
	let new_amount = parseInt(account_info.rows[0].amount) + value;

	if (account_name) {
		pool.query('UPDATE accounts SET amount = $1 WHERE username = $2 AND name = $3', [new_amount, username, account_name], (error, results) => {
			if (error) console.log(error);
			else console.log('updated the associated account');
		})
	} 
	else console.log("ERROR: invalid account name");

	// update the category
	const category_name = transaction.category;
	console.log('category_name: ' + category_name);
	const new_category_amount = value + parseInt(account_info.rows[0].amount);
	const category_info = await pool.query('SELECT * FROM categories WHERE username = $1 AND name = $2', [username, transaction.category]);
	if (transaction.type != category_info.rows[0].type) {
		console.log('category found was wrong Type');
	}

	if (category_name) {
		pool.query('UPDATE categories SET current_amount = $1 WHERE username = $2 AND name = $3', [new_category_amount, username, category_name], (error, results) => {
			if (error) {
				console.log(error);
			} else {
				console.log('updated the associated category')
			}
		})
	} else {
		console.log("ERROR: invalid category name");
	}


	pool.query('INSERT INTO transactions (name, date, amount, type, note, category, username, account) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [transaction.name, date, transaction.amount, transaction.type, transaction.note, transaction.category, username, transaction.account], (error, results) => {
		if (error) {
			console.log(error);
		} else {
		console.log('created new transaction');
		res.send("created transaction successfully!")
		}
	})
}