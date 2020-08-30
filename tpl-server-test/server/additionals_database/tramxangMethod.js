const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, tramxang_name) => {
        try {
            const query1 = await pool.query(`
            INSERT INTO tramxang (usr_id, name)
            VALUES ($1, $2)
            `,[usr_id, tramxang_name]);
        } catch (err) {
            throw new Error({message: 'failed at tramxang insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as tramxang
            FROM tramxang 
            WHERE usr_id = $1
            ORDER BY id desc
            `,[usr_id]);
            const array_of_tramxang = query1.rows;
            return array_of_tramxang;

        } catch (err) {
            throw new Error({message: 'failed at tram xang print method', Err: err});
        }
    },

}