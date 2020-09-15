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
            //Take diadiem in chiphi table

            const query1 = await pool.query(`
            SELECT DISTINCT cp.place as id, dd.name as diadiem
            FROM chiphi as cp
            INNER JOIN diadiem as dd
                ON cp.place = dd.id
            WHERE cp.u_id = $1 AND cp.place IS NOT NULL
            `,[usr_id]);
            
            //Take diadiem in dichvu table
            const query2 = await pool.query(`
            SELECT DISTINCT dv.place as id, dd.name as diadiem
            FROM dichvu as dv
            INNER JOIN diadiem as dd
                ON dv.place = dd.id
            WHERE dv.u_id = $1 AND dv.place IS NOT NULL
            `, [usr_id]);
            
            //Take diadiem in diadiem table
            const query3 = await pool.query(`
            SELECT id, name as diadiem
            FROM diadiem
            WHERE usr_id = $1 AND is_black_listed = 'no'
            `, [usr_id]);
            
            //the filtering process
            const cp_diadiem_name = query1.rows.map(each_row => each_row.diadiem);
            const dv_diadiem_name = query2.rows.map(each_row => each_row.diadiem);

            let used_arr = []; let the_rest_arr = [];
            
            query3.rows.forEach(
                each_row => {
                    const {diadiem} = each_row;
                    if (cp_diadiem_name.includes(diadiem)) return used_arr.push(each_row);
                    if (dv_diadiem_name.includes(diadiem)) return used_arr.push(each_row);
                    return the_rest_arr.push(each_row);
                }
            );
            
            return {used_arr, the_rest_arr};

        } catch (err) {
            throw new Error(err);
        }
    },

    _print_black_list: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as diadiem
            FROM diadiem
            WHERE usr_id = $1 AND is_black_listed = 't'
            `, [usr_id]);
            return query1.rows;
        } catch (err) {
            throw new Error(err);
        }
    },

    _add_to_black_list: async (usr_id, diadiem_id) => {
        try {
            const diadiem_idF = parseFloat(diadiem_id);
            const query1 = await pool.query(`
            UPDATE diadiem
            SET is_black_listed = 'true'
            WHERE usr_id = $1 AND id = $2
            RETURNING is_black_listed
            `, [usr_id, diadiem_idF]);
            return query1.rows[0].is_black_listed
        } catch (err) {
            throw new Error(err);
        }
    },

    _remove_from_black_list: async (usr_id, diadiem_id) => {
        const diadiem_idF = parseFloat(diadiem_id);
        try {
            const query1 = await pool.query(`
            UPDATE diadiem
            SET is_black_listed = false
            WHERE usr_id = $1 AND id = $2
            RETURNING is_black_listed
            `, [usr_id, diadiem_idF]);
            return query1.rows[0].is_black_listed;
        } catch (err) {
            throw new Error(err);
        }
    },
}