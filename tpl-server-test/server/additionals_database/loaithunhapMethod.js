const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, loaithunhap_name) => {
        try {
            const query1 = await pool.query(`
            INSERT INTO loaithunhap (usr_id, name)
            VALUES ($1, $2)
            `,[usr_id, loaithunhap_name]);
        } catch (err) {
            throw new Error({message: 'failed at loaithunhap insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as loaithunhap
            FROM loaithunhap 
            WHERE usr_id = $1
            ORDER BY id desc
            `,[usr_id]);
            const array_of_loaithunhap = query1.rows;
            return array_of_loaithunhap;

        } catch (err) {
            throw new Error({message: 'failed at loaithunhap print method', Err: err});
        }
    },

}