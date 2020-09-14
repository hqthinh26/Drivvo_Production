const pool = require('../database/pooling');

const is_alr_existing = async (usr_id, loaidichvu_name) => {
    try {
        const query1 = await pool.query(`
        SELECT name 
        FROM loaidichvu
        WHERE usr_id = $1 AND name = $2
        `, [usr_id, loaidichvu_name]);
       
        return query1.rowCount === 0 ? false : true;
    } catch (err) {
        throw new Error(err);
    }
}
module.exports = {
    _insert: async (usr_id, loaidichvu_name) => {
        try {
            const is_Existing = await is_alr_existing(usr_id, loaidichvu_name);
            //Meaning this name doesnt in the database
            if ( is_Existing === false) {
                const query1 = await pool.query(`
                INSERT INTO loaidichvu (usr_id, name)
                VALUES ($1, $2)
                RETURNING id
                `,[usr_id, loaidichvu_name]);
                return {status: true, loaidichvu_id: query1.rows[0].id}
                
            } 
            return {status: false};
        } catch (err) {
            throw new Error({message: 'failed at loaidichvu insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT DISTINCT dv.type_of_service as id, ldv.name as loaidichvu
            FROM dichvu as dv
            INNER JOIN loaidichvu as ldv
                ON dv.type_of_service = ldv.id
            WHERE dv.u_id = $1
            `, [usr_id])
            const loaidichvu_IN_dichvuTable = query1.rows;

            const query2 = await pool.query(`
            SELECT id, name as loaidichvu
            FROM loaidichvu
            WHERE usr_id = $1
            `, [usr_id]);
            const loaidichvu_IN_loaidichvuTable = query2.rows;

            const reduced_loaidichvu_table = loaidichvu_IN_loaidichvuTable.filter(
                each_loaidichvu => {
                    const {loaidichvu} = each_loaidichvu;
                    const only_names = loaidichvu_IN_dichvuTable.map(each_row => each_row.loaidichvu);
                    console.table(only_names);
                    return !only_names.includes(loaidichvu);
                }
            );
            return {used_arr: loaidichvu_IN_dichvuTable, the_rest_arr: reduced_loaidichvu_table};
        } catch (err) {
            throw new Error(err);
        }
    }

    // _print: async (usr_id) => {
    //     try {
    //         const query1 = await pool.query(`
    //         SELECT id, name as loaidichvu
    //         FROM loaidichvu 
    //         WHERE usr_id = $1
    //         ORDER BY id desc
    //         `,[usr_id]);
    //         const array_of_loaidichvu = query1.rows;
    //         return array_of_loaidichvu;

    //     } catch (err) {
    //         throw new Error({message: 'failed at loaidichvu print method', Err: err});
    //     }
    // },

}