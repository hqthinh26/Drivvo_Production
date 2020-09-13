const pool = require('../database/pooling');

const is_alr_existing = async (usr_id, loaithunhap_name) => {
    try {
        const query1 = await pool.query(`
        SELECT name
        FROM loaithunhap
        WHERE usr_id = $1 AND name = $2
        `, [usr_id, loaithunhap_name]);
        return query1.rowCount === 0 ? false : true;
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    _insert: async (usr_id, loaithunhap_name) => {
        try {
            if (await is_alr_existing(usr_id, loaithunhap_name) === false) {
                const query1 = await pool.query(`
                INSERT INTO loaithunhap (usr_id, name)
                VALUES ($1, $2)
                `,[usr_id, loaithunhap_name]);
                return true; //Meaning successfully adding the new thu nhap to the database
            }
            return false; //Meaning this input name alr stays in the database => preventing duplication
        } catch (err) {
            throw new Error({message: 'failed at loaithunhap insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT DISTINCT tn.type_of_income as id, ltn.name as loaithunhap
            FROM thunhap as tn
            INNER JOIN loaithunhap as ltn
                ON tn.type_of_income = ltn.id
            WHERE u_id = $1
            `,[usr_id]);
            const loaithunhap_IN_thunhapTable = query1.rows;

            const query2 = await pool.query(`
            SELECT id, name as loaithunhap
            FROM loaithunhap
            WHERE usr_id = $1
            `, [usr_id]);
            const loaithunhap_IN_loaithunhapTable = query2.rows;

            const reduced_loaithunhapTable = loaithunhap_IN_loaithunhapTable.filter(
                (each_loaithunhap) => {
                    const {loaithunhap} = each_loaithunhap;
                    const only_names = loaithunhap_IN_thunhapTable.map(each_row => each_row.loaithunhap);
                    return !only_names.includes(loaithunhap);
                }
            );
            
            return {used_arr: loaithunhap_IN_thunhapTable, the_rest_arr: reduced_loaithunhapTable};
        } catch (err) {
            throw new Error(err);
        }
    }

    // _print: async (usr_id) => {
    //     try {
    //         const query1 = await pool.query(`
    //         SELECT id, name as loaithunhap
    //         FROM loaithunhap 
    //         WHERE usr_id = $1
    //         ORDER BY id desc
    //         `,[usr_id]);
    //         const array_of_loaithunhap = query1.rows;
    //         return array_of_loaithunhap;

    //     } catch (err) {
    //         throw new Error({message: 'failed at loaithunhap print method', Err: err});
    //     }
    // },

}