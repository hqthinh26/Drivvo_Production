const pool = require('../database/pooling');

const is_alr_exsiting = async (usr_id, tramxang_name) => {
    try {
        const query1 = await pool.query(`
        SELECT name
        FROM tramxang
        WHERE usr_id = $1 AND name = $2
        `, [usr_id, tramxang_name]);
        return query1.rowCount === 0 ? false : true;
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    _insert: async (usr_id, tramxang_name) => {
        try {
            if (await is_alr_exsiting(usr_id, tramxang_name) === false) {
                const query1 = await pool.query(`
                INSERT INTO tramxang (usr_id, name)
                VALUES ($1, $2)
                `,[usr_id, tramxang_name]);
                return true;
            }
            return false;
        } catch (err) {
            throw new Error({message: 'failed at tramxang insert method', ERR: err});
        }
    },

    _print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT DISTINCT nnl.gas_station as id, tx.name as gas_station
            FROM napnhienlieu as nnl
            INNER JOIN tramxang as tx
                ON nnl.gas_station = tx.id
            WHERE nnl.u_id = $1 AND tx.is_black_listed = $2
            `, [usr_id, false]);
            const tramxang_IN_napnhienlieuTable_notBlackedListed = query1.rows;

            const query2 = await pool.query(`
            SELECT id, name as gas_station
            FROM tramxang
            WHERE usr_id = $1 AND is_black_listed = $2
            `, [usr_id, false]);

            const tramxang_IN_tramxangTable_notBlackListed = query2.rows;

            //Filter - Remove duplicates in tramxang_IN_tramxangTable_notBlackListed
            const reduced_tramxangTable = tramxang_IN_tramxangTable_notBlackListed.filter(
                each_tramxang => {
                    const {gas_station} = each_tramxang;
                    const only_names = tramxang_IN_napnhienlieuTable_notBlackedListed.map(each_row => each_row.gas_station);
                    return !only_names.includes(gas_station);
                }
            );

            return {used_arr: tramxang_IN_napnhienlieuTable_notBlackedListed, the_rest_arr: reduced_tramxangTable}
        } catch (err) {
            throw new Error(err);
        }
    },

    _print_black: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT id, name as gas_station
            FROM tramxang
            WHERE usr_id = $1 AND is_black_listed = $2
            ORDER BY created_at desc
            `, [usr_id, true]);
            return query1.rows;
        } catch (err) {
            throw new Error(err);
        }
    },

    _add_to_black_list: async (usr_id, tramxang_id) => {
        try {
            const tramxang_idB = BigInt(tramxang_id);
            const query1 = await pool.query(`
            UPDATE tramxang
            SET is_black_listed = true
            WHERE usr_id = $1 AND id = $2
            RETURNING is_black_listed as value_after_modified
            `, [usr_id, tramxang_idB]);
            return query1.rows[0];
        } catch (err) {
            throw new Error(err);
        }
    },

    _remove_from_black_list: async (usr_id, tramxang_id) => {
        try {
            const tramxang_idB = BigInt(tramxang_id);
            const query1 = await pool.query(`
            UPDATE tramxang
            SET is_black_listed = false
            WHERE usr_id = $1 AND id = $2
            RETURNING is_black_listed as value_after_modified
            `, [usr_id, tramxang_idB])
            return query1.rows[0];
        } catch (err) {
            throw new Error(err);
        }
    }
}