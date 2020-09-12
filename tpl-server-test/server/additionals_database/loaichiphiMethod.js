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
            //Look in the chiphi table and check out what loai chi phi names are used 
            const query1 = await pool.query(`
            SELECT DISTINCT cp.type_of_expense as id, lcp.name as loaichiphi
            FROM chiphi as cp
            INNER JOIN loaichiphi as lcp
                ON cp.type_of_expense = lcp.id
            WHERE cp.u_id = $1
            `, [usr_id]);
            const loaichiphi_In_chiphiTable = query1.rows;

            const query2 = await pool.query(`
            SELECT id, name as loaichiphi
            FROM loaichiphi
            WHERE usr_id = $1
            `, [usr_id]);
            const loaichiphi_IN_loaichiphiTable = query2.rows;
            
            const reduced_loaichiphiTable = loaichiphi_IN_loaichiphiTable.filter(
                (each_loaichiphi) => {
                    const {loaichiphi} = each_loaichiphi;
                    const only_name = loaichiphi_In_chiphiTable.map(each_row => each_row.loaichiphi);
                    return !only_name.includes(loaichiphi);
                }
            );
            return {used_arr: loaichiphi_In_chiphiTable, the_rest_arr: reduced_loaichiphiTable};
        } catch (err) {
            throw new Error(err);
        }
    },

    // _print: async (usr_id) => {
    //     try {
    //         const query1 = await pool.query(`
    //         SELECT id, name as loaichiphi 
    //         FROM loaichiphi 
    //         WHERE usr_id = $1
    //         ORDER BY id desc
    //         `,[usr_id]);
    //         const array_of_loaichiphi = query1.rows;
    //         return array_of_loaichiphi;

    //     } catch (err) {
    //         throw new Error({message: 'failed at loaichiphi print method', Err: err});
    //     }
    // },


}