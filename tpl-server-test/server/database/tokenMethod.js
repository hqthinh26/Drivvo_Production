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
            console.log('import token successfully')
        } catch (err) {
            console.log(err);
        }
    },
    delete: async (token) => {
        try {
            await pool.query(`delete from token where token_value = $1`, [token]);
            console.log('successfully delete a row from token');
            return true;
        } catch (err) {
            console.log('failed to execute delete query');
            return false;
        }
    }
}