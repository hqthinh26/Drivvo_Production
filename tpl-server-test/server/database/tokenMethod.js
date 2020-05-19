const pool = require('./pooling');

module.exports = {
    printall: async (req,res) => {
        try {
            const results = await pool.query('select * from token');
            res.status(200).send(results.rows);
        } catch (err) {
            res.sendStatus(403);
        }
    },
    insert: async (token) => {
        try {
            await pool.query(`insert into token(token_value)
        values ($1)`,[token]);
            console.log('successful')
        } catch (err) {
            console.log(err);
        }
    }
}