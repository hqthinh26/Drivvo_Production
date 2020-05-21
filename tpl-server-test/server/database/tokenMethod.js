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
            await pool.query(`insert into token(token_value)
            values ($1)`,[token]);
            console.log('import token successfully');
    },

    delete: async (token) => {
            await pool.query(`delete from token where token_value = $1`, [token]);
            console.log('successfully delete a row from token');
            return true;
    },

    tokenExist: async (token) => {
        const result = await pool.query(`select token_value from token where token_value = $1`,[token]);

        //If rowCount === 1 -> we found the token which is predefined to be UNIQUE
        return result.rowCount === 1? true: false;
    }
}