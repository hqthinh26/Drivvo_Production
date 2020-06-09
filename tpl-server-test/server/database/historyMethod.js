const pool = require('./pooling');

module.exports = {
    // Step 1: Insert Type:text and uuid_id of that particular form in its private table: like napnhieulieu or chi phi table
   
    _return_all_form: async (usr_id, number_of_rows) => {
        try {
            const results = await pool.query(`SELECT * FROM history where usr_id = $1 
                                              ORDER BY created_at_date, created_at_time DESC
                                              LIMIT $2`, [usr_id, number_of_rows]);
            return results.rows;
        } catch (err) {
            throw new Error('Failed at return_all_form');
        }
    },

    _return_detail_each_form: async (each_history_form) => {
        const {type_of_form, id_private_form} = each_history_form;
        if (type_of_form === 'napnhienlieu') {
            console.log('this is nll');
            return pool.query(`select * from napnhienlieu where id = $1`, [id_private_form]);
        }
        if (type_of_form === 'chiphi') {
            console.log('this is chiphi');
            return pool.query(`select * from chiphi where id = $1`, [id_private_form]);
        }
        if (type_of_form === 'dichvu') {
            console.log('this is dichvu');
            return pool.query(`select * from dichvu where id = $1`, [id_private_form]);
        }
        if(type_of_form === 'thunhap') {
            console.log('this is thunhap');
            return pool.query(`select * from thunhap where id = $1`, [id_private_form]);
        }
        throw new Error('not matching anything');
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
            console.log({message: 'failed at all_form_insert NLL', err});
        }
    },
   
    _allform_Insert_chiphi: async (usr_id, type_of_form, id_private_form, time_date) => {
        
        const amountI = parseInt(amount);

        const {time, date} = time_date;

        try {
            await pool.query(`insert into 
            history(usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1,$2,$3,$4,$5)`
            , [usr_id, type_of_form, id_private_form, time, date]);

        } catch (err) {
            console.log({message: 'failed at _all_form_insert_chiphi', err});
        }
    },

    _all_form_insert_dichvu: async (usr_id, type_of_form, id_private_form, time_date) => {

        //Step 1: Amount in Postgres is INT type but here Amount is JSON form => We convert Stirng to Int
        const amountI = parseInt(amount);

        const {time, date} = time_date;

        try {
            await pool.query(`insert into 
            history(usr_id, type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1,$2,$3,$4,$5)`, [usr_id, type_of_form, id_private_form, time, date]);

        } catch (err) {
            throw new Error({message: 'failed at All_Form_Dich_Vu', err});
        }
    },

    _all_form_insert_thunhap: async (usr_id, type_of_form, id_private_form, time_date) => {

        const {time, date} = time_date;

        //Step 2: Amount in PostgreSQL is INT type but here Amount is JSON Form => We need to convert String to INT
        const amountI = parseInt(amount);

        try {
            await pool.query(`insert into 
            history(usr_id ,type_of_form, id_private_form, created_at_time, created_at_date)
            values ($1, $2, $3, $4, $5)`
            ,[usr_id , type_of_form, id_private_form, time, date]);

        } catch (err) {
            console.log({message: 'Failed in all_form_insert_ThuNhap', err});
        }
    },

}