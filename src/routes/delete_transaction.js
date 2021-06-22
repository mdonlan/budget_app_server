const jwt = require('jsonwebtoken');

module.exports = async function delete_transaction(req, res, pool) {
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

}