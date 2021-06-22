/*

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

*/

const jwt = require('jsonwebtoken');

module.exports = async function create_category(req, res, pool) {
    console.log('start of create category')
	
	if (!req.body.token) {
		res.send('no username');
		return;
	}
	
  	const category = req.body.category;
  	const username = jwt.decode(req.body.token, 'private_key').username;

    pool.query('INSERT INTO categories (name, type, username, current_amount, total_amount) VALUES ($1, $2, $3, $4, $5)', [category.name, category.type, username, category.current_amount, category.total_amount], (error, results) => {
        if (error) console.log(error);
        else {
            res.send("created category successfully!")
        }
    })
}