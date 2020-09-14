const pool = require('../database/pooling');

const is_alr_exsiting = async (usr_id, loainhienlieu_name) => {
    try {
        const query1 = await pool.query(`
        SELECT name 
        FROM loainhienlieu 
        WHERE usr_id = $1 AND name = $2`, [usr_id, loainhienlieu_name]);
        return query1.rowCount === 0 ? false : true;
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    _insert: async (usr_id, loainhienlieu_name) => {

        try {
            if (await is_alr_exsiting(usr_id, loainhienlieu_name) === false) {
                const query1 = await pool.query(`
                INSERT INTO loainhienlieu(usr_id, name)
                VALUES ($1, $2)
                RETURNING id
                `, [usr_id, loainhienlieu_name]);
                
                return {status: true, loainhienlieu_id: query1.rows[0].id};
            }
            return {status: false};
        } catch (err) {
            throw new Error({message: 'Failed at loainhienlieuMethod', ERR: err});
        }
        
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT DISTINCT nnl.type_of_fuel as id, lnl.name as loainhienlieu
            FROM napnhienlieu as nnl
            INNER JOIN loainhienlieu as lnl
                ON nnl.type_of_fuel = lnl.id
            WHERE u_id = $1
            `, [usr_id]);
            const loainhienlieu_in_napnhiennlieuTable = query1.rows;

            const query2 = await pool.query(`
            SELECT id, name as loainhienlieu
            FROM loainhienlieu
            WHERE usr_id = $1
            `, [usr_id]);
            const loainhienlieu_IN_loainhienlieuTable = query2.rows;

            const reduced_loainhienlieuTable = loainhienlieu_IN_loainhienlieuTable.filter(
                each_loainhienlieu => { //this is an object containing the SRING as one of its values
                    const {loainhienlieu} = each_loainhienlieu; //this is a string
                    const only_names = loainhienlieu_in_napnhiennlieuTable.map(each_row => each_row.loainhienlieu);
                    return !only_names.includes(loainhienlieu);
                }
            );
            return {used_arr: loainhienlieu_in_napnhiennlieuTable, the_rest_arr: reduced_loainhienlieuTable};
        } catch (err) {
            throw new Error(err);
        }
    }

    // _print: async (usr_id) => {
    //     try {
    //         const query1 = await pool.query(`
    //         SELECT id, name as loainhienlieu
    //         FROM loainhienlieu 
    //         WHERE usr_id = $1
    //         ORDER BY id desc
    //         `, [usr_id]);

    //         const array_of_rows = query1.rows;
    //         return array_of_rows;
    //     }
    //     catch (err) {
    //         throw new Error({message: 'failed at print loainhienlieu Method', ERR: err});
    //     }
    // }, 
}