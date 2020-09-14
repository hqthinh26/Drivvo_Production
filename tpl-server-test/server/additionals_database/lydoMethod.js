const pool = require('../database/pooling');

const is_existing = async (usr_id, lydo_name) => {
    try {
        const query1 = await pool.query(`
        SELECT name 
        FROM lydo
         WHERE usr_id = $1 AND name = $2
        `, [usr_id, lydo_name]);
        return query1.rowCount === 0 ? false : true;
    } catch (err) {
        throw new Error(err);
    }
}
module.exports = {
    _insert: async (usr_id, lydo_name) => {
        try {
            const is_exist = await is_existing(usr_id, lydo_name);

            if (is_exist === false) {
                const query1 = await pool.query(`
                INSERT INTO lydo (usr_id, name)
                VALUES ($1, $2)
                RETURNING id
                `,[usr_id, lydo_name]);
                
                return {status: true, lydo_id: query1.rows[0].id};
            }
            return {status: false};
        } catch (err) {
            throw new Error({message: 'failed at lydo insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as lydo
            FROM lydo 
            WHERE usr_id = $1
            ORDER BY id desc
            `,[usr_id]);
            const array_of_lydo = query1.rows;
            return array_of_lydo;

        } catch (err) {
            throw new Error({message: 'failed at lydo print method', Err: err});
        }
    },

}