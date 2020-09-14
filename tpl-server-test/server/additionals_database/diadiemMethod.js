const pool = require('../database/pooling');

const is_Existing =  async (usr_id, diadiem_name) => {
    try {
        const query1 = await pool.query(`
        SELECT name
        FROM diadiem
        WHERE usr_id = $1 AND name = $2
        `, [usr_id, diadiem_name]);
        
        return query1.rowCount === 0 ? false : true;
    } catch (err) {
        throw new Error(err);   
    }
}

module.exports = {
    _insert: async (usr_id, diadiem_name) => {
        try {
            if (await is_Existing(usr_id, diadiem_name) === false) {
                const query1 = await pool.query(`
                INSERT INTO diadiem (usr_id, name)
                VALUES ($1, $2)
                RETURNING id
                `,[usr_id, diadiem_name]);
                return {status: true, diadiem_id: query1.rows[0].id};
                }
            return {status: false}
        } catch (err) {
            throw new Error({message: 'failed at diadiem insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as diadiem
            FROM diadiem 
            WHERE usr_id = $1
            ORDER BY id desc
            `,[usr_id]);
            const array_of_diadiem = query1.rows;
            return array_of_diadiem;

        } catch (err) {
            throw new Error({message: 'failed at diadiem print method', Err: err});
        }
    },

}