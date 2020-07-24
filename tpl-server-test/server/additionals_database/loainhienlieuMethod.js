const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, loainhienlieu_name) => {

        try {
            const query1 = await pool.query(`
            INSERT INTO loainhienlieu(usr_id, name)
            VALUES ($1, $2)
            `, [usr_id, loainhienlieu_name]);
        } catch (err) {
            throw new Error({message: 'Failed at loainhienlieuMethod', ERR: err});
        }
        
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as loainhienlieu
            FROM loainhienlieu 
            WHERE usr_id = $1
            `, [usr_id]);

            const array_of_rows = query1.rows;
            return array_of_rows;
        }
        catch (err) {
            throw new Error({message: 'failed at print loainhienlieu Method', ERR: err});
        }
    }, 
}