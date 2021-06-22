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

	if (!account_name) {
		console.log("ERROR: invalid account name when attempting to create new transaction");
		res.status(422).send('ERROR: invalid account name when attempting to create new transaction');
	}
	
	/* update the account's amount */
	let account_amount = parseFloat(account_info.rows[0].amount);
	let transaction_amount = parseFloat(transaction.amount);
	let new_account_amount = account_amount + transaction_amount;

	// pool.query('UPDATE accounts SET amount = $1 WHERE username = $2 AND name = $3', [new_amount, username, account_name], (error, results) => {
	// 	if (error) console.log(error);
	// 	else console.log('updated the associated account with the new transaction');
	// })

	/* update the category amount */
	const category_name = transaction.category;
	const category_info = await pool.query('SELECT * FROM categories WHERE username = $1 AND name = $2', [username, transaction.category]);
	console.log("category_info: ", category_info)
	const current_category_amount = parseFloat(category_info.rows[0].current_amount);
	const new_category_amount = current_category_amount + transaction_amount;

	pool.query('UPDATE categories SET current_amount = $1 WHERE username = $2 AND name = $3', [new_category_amount, username, category_name], (error, results) => {
		if (error) console.log(error);
		else console.log('updated the associated category amount')
	})

	pool.query('INSERT INTO transactions (name, date, amount, type, note, category, username, account) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [transaction.name, date, transaction.amount, transaction.type, transaction.note, transaction.category, username, transaction.account], (error, results) => {
		if (error) console.log(error);
		else {
			console.log('created new transaction');
			res.send("created transaction successfully!")
		}
	})
}