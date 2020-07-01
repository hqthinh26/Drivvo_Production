const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, lydo_name) => {
        try {
            const query1 = await pool.query(`
            INSERT INTO lydo (usr_id, name)
            VALUES ($1, $2)
            `,[usr_id, lydo_name]);
        } catch (err) {
            throw new Error({message: 'failed at lydo insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name FROM lydo WHERE usr_id = $1
            `,[usr_id]);
            const array_of_lydo = query1.rows;
            return array_of_lydo;

        } catch (err) {
            throw new Error({message: 'failed at lydo print method', Err: err});
        }
    },

}