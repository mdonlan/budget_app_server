const jwt = require('jsonwebtoken');

module.exports = async function validate_token(req, res, pool) {
    console.log('attempting to validate token')
  
    const decoded = jwt.verify(req.body.token, 'private_key');
  
    await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username], (error, results) => {
        if (error) console.log(error);
        else {
            if (results.rowCount > 0) {
                if (results.rows[0].username == decoded.username) {
                    res.status(200).send({ valid_token: true, username: decoded.username });
                }
            } else {
                res.status(200).send({ valid_token: false, username: decoded.username });
            }
        }
    })
}