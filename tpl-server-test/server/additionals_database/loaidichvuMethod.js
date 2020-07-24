const pool = require('../database/pooling');

module.exports = {
    _insert: async (usr_id, loaidichvu_name) => {
        try {
            const query1 = await pool.query(`
            INSERT INTO loaidichvu (usr_id, name)
            VALUES ($1, $2)
            `,[usr_id, loaidichvu_name]);
        } catch (err) {
            throw new Error({message: 'failed at loaidichvu insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as loaidichvu
            FROM loaidichvu 
            WHERE usr_id = $1
            `,[usr_id]);
            const array_of_loaidichvu = query1.rows;
            return array_of_loaidichvu;

        } catch (err) {
            throw new Error({message: 'failed at loaidichvu print method', Err: err});
        }
    },

}