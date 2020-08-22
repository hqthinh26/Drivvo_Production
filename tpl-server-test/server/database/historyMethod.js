const pool = require('./pooling');

module.exports = {
    // Step 1: Insert Type:text and uuid_id of that particular form in its private table: like napnhieulieu or chi phi table
   
    _return_all_form: async (usr_id) => {
        try {
            const results = await pool.query(`SELECT * FROM history 
                                            where usr_id = $1
                                              ORDER BY created_at_date DESC, created_at_time DESC
                                              LIMIT 15`, [usr_id]);
            return results.rows;
        } catch (err) {
            throw new Error({message:'Failed at return_all_form',ERR: err});
        }
    },

    _return_detail_each_form: async (each_history_form) => {
        const {type_of_form, id_private_form} = each_history_form;
        if (type_of_form === 'napnhienlieu') {
            console.log('this is nll');
            return pool.query(`
            SELECT nll.id, nll.odometer, lnl.name as type_of_fuel, nll.price_per_unit, nll.total_cost, nll.total_units, nll.full_tank, tx.name as gas_station, ld.name as reason, nll.time, nll.date 
            FROM napnhienlieu as nll, loainhienlieu as lnl, tramxang as tx, lydo as ld
            WHERE       (nll.id = $1)
                    AND (nll.type_of_fuel = lnl.id)
                    AND (nll.gas_station = tx.id)
                    AND (nll.reason = ld.id)
            `, [id_private_form]);
        }
        if (type_of_form === 'chiphi') {
            console.log('this is chiphi');
            return pool.query(`
            SELECT cp.id, cp.odometer, lcp.name as type_of_expense, cp.amount, dd.name as place, ld.name as reason, cp.note, cp.time, cp.date
            FROM chiphi as cp, loaichiphi as lcp, diadiem as dd, lydo as ld
            WHERE       (cp.id = $1)
                    AND (cp.type_of_expense = lcp.id)
                    AND (cp.place = dd.id)
                    AND (cp.reason = ld.id)
            `, [id_private_form]);
        }
        if (type_of_form === 'dichvu') {
            console.log('this is dichvu');
            return pool.query(`
            SELECT dv.id, dv.odometer, ldv.name as type_of_service, dv.amount, dd.name as place, dv.note, dv.time, dv.date
            FROM dichvu as dv, loaidichvu as ldv, diadiem as dd
            WHERE       (dv.id = $1)
                    AND (dv.type_of_service = ldv.id)
                    AND (dv.place = dd.id)
            `, [id_private_form]);
        }
        if(type_of_form === 'thunhap') {
            console.log({message: 'this is thunhap',id_private_form});
            return pool.query(`
            SELECT tn.id, tn.odometer, ltn.name as type_of_income, tn.amount, tn.note, tn.time, tn.date
            FROM thunhap as tn, loaithunhap as ltn
            WHERE       (tn.id = $1)
                    AND (tn.type_of_income = ltn.id) 
            `, [id_private_form]);
        }
        if(type_of_form === 'quangduong') {
            console.log({message: 'this is quangduong',id_private_form});
            return pool.query(`
            SELECT qd.id, qd.origin, qd.start_time, qd.start_date, qd.initial_odometer, qd.destination, qd.end_time, qd.end_date, qd.final_odometer, qd.value_per_km, qd.total, ld.name as reason
            FROM quangduong as qd, lydo as ld
            WHERE       (qd.id = $1)
                    AND (qd.reason = ld.id)
            `, [id_private_form]);
        }
        // if (type_of_form === 'nhacnho') {
        //     console.log('this is nhac nho');
        //     return pool.query(`select * from nhacnho where id = $1`, [id_private_form]);
        // }
        // throw new Error({message: 'there is an undefined type_of_form'});
    },

    _allform_Insert_napnhieulieu: async (usr_id, type_of_form, id_private_form, time_date) => {
        //There are 4 types of form. Consequently, there will be 4 IF-s
        //By default: Type_of_form is NAPNHIENLIEU
        const {time, date} = time_date;

        try {
            await pool.query(`insert into 
            history(usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1,$2,$3,$4,$5)`, 
            [usr_id, type_of_form, id_private_form, time, date]);
        } catch (err) {
            throw new Error({message: 'failed at all_form_insert NLL', ERR:err});
        }
    },
   
    _allform_Insert_chiphi: async (usr_id, type_of_form, id_private_form, time_date) => {
        const {time, date} = time_date;

        try {
            await pool.query(`insert into 
            history(usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1,$2,$3,$4,$5)`
            , [usr_id, type_of_form, id_private_form, time, date]);
            console.log('SUCCCCCCC');
        } catch (err) {
            console.log({message: 'failed at _all_form_insert_chiphi', ERR:err});
        }
    },

    _all_form_insert_dichvu: async (usr_id, type_of_form, id_private_form, time_date) => {

        const {time, date} = time_date;

        try {
            await pool.query(`insert into 
            history(usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1,$2,$3,$4,$5)`, [usr_id, type_of_form, id_private_form, time, date]);

        } catch (err) {
            throw new Error({message: 'failed at All_Form_Dich_Vu', ERR:err});
        }
    },

    _all_form_insert_thunhap: async (usr_id, type_of_form, id_private_form, time_date) => {

        const {time, date} = time_date;

        try {
            await pool.query(`insert into 
            history(usr_id ,type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1, $2, $3, $4, $5)`
            ,[usr_id , type_of_form, id_private_form, time, date]);

        } catch (err) {
            throw new Error({message: 'Failed at all_form_insert_thunhap in history method', ERR: err});
        }
    },

    _all_form_insert_quangduong: async (usr_id, type_of_form, id_private_form, time_date) => {
        const {end_time, end_date} = time_date;
        try {
            await pool.query(`insert into 
            history(usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1, $2, $3, $4, $5)`
            , [usr_id, type_of_form, id_private_form, end_time, end_date]);
        } catch (err) {
            throw new Error({message:'failed at all_form_insert_quangduong in historyMethod',ERR: err});
        }
    },

    _all_form_insert_nhacnho: async (usr_id, type_of_form, id_private_form, time_date) => {
        const {time, date} = time_date;
        try {
            await pool.query(`insert into
            history (usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1, $2, $3, $4, $5)`
            , [usr_id, type_of_form, id_private_form, time, date]);

        } catch (err) {
            throw new Error({message: 'failed at all_form_insert_nhacnho history method', Err:err});
        }
    }
}