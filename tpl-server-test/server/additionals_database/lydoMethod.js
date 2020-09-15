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
            //Take lydo in quangduong table
            const query1 = await pool.query(`
            SELECT DISTINCT qd.reason as id, ld.name as lydo
            FROM quangduong as qd
            INNER JOIN lydo as ld
                ON qd.reason = ld.id
            WHERE qd.usr_id = $1 AND qd.reason IS NOT NULL
            `, [usr_id]); //[2,3]
            
             //Take lydo in chiphi table
            const query2 = await pool.query(`
            SELECT DISTINCT cp.reason as id, ld.name as lydo
            FROM chiphi as cp
            INNER JOIN lydo as ld
                ON cp.reason = ld.id
            WHERE cp.u_id = $1 AND cp.reason IS NOT NULL
            `, [usr_id]);
        
            //take lydo in lydo table
            const query3 = await pool.query(`
            SELECT id, name as lydo
            FROM lydo
            WHERE usr_id = $1
            `, [usr_id]);
            
            //Filtrating Process
            const qd_reason_arr = query1.rows.map(each_row => each_row.lydo);
            const cp_reason_arr = query2.rows.map(each_row => each_row.lydo);
            
            let used_arr = []; let the_rest_arr = [];

            query3.rows.forEach(
                each_row => {
                    const {lydo} = each_row;
                    if (qd_reason_arr.includes(lydo)) return used_arr.push(each_row);
                    if (cp_reason_arr.includes(lydo)) return used_arr.push(each_row);
                    return the_rest_arr.push(each_row);
                }
            );
            
            return {used_arr, the_rest_arr};
        } catch (err) {

        }
    },

}