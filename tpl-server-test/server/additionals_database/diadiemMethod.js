const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, diadiem_name) => {
        try {
            const query1 = await pool.query(`
            INSERT INTO diadiem (usr_id, name)
            VALUES ($1, $2)
            `,[usr_id, diadiem_name]);
        } catch (err) {
            throw new Error({message: 'failed at diadiem insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name FROM diadiem WHERE usr_id = $1
            `,[usr_id]);
            const array_of_diadiem = query1.rows;
            return array_of_diadiem;

        } catch (err) {
            throw new Error({message: 'failed at diadiem print method', Err: err});
        }
    },

}