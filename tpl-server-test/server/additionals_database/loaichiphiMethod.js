const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, loaichiphi_name) => {
        try {
            const query1 = await pool.query(`
            INSERT INTO loaichiphi (usr_id, name)
            VALUES ($1, $2)
            `,[usr_id, loaichiphi_name]);
        } catch (err) {
            throw new Error({message: 'failed at loaichiphi insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as loaichiphi 
            FROM loaichiphi 
            WHERE usr_id = $1
            ORDER BY id desc
            `,[usr_id]);
            const array_of_loaichiphi = query1.rows;
            return array_of_loaichiphi;

        } catch (err) {
            throw new Error({message: 'failed at loaichiphi print method', Err: err});
        }
    },

}