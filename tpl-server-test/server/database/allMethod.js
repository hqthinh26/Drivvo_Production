const pool = require('./pooling');

module.exports = {
    // Step 1: Insert Type:text and uuid_id of that particular form in its private table: like napnhieulieu or chi phi table
   
    _return_all_form: async (id_usr) => {
        try {
            const results = await pool.query(`select * from allform where id_usr = $1`, [id_usr]);
            return results;
        } catch (err) {
            throw new Error('Failed at return_all_form');
        }
    },

    _allform_Insert_napnhieulieu: async (id_usr, type_of_form, id_private_form ,inputFromUser) => {
        //There are 4 types of form. Consequently, there will be 4 IF-s
        const {odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location, date, time} = inputFromUser;
        
        try {
                await pool.query(`insert into 
                allform(id_usr, type_of_form, id_private_form, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location, date, time)
                values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, 
                [id_usr, type_of_form, id_private_form, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location,date,time]);
        } catch (err) {
            console.log({message: 'failed at all_form_insert NLL', err});
        }
    },
   
    _allform_Insert_chiphi: async (id_usr, type_of_form, id_private_form, inputFromUser) => {
        const {odometer, type_of_expense, amount, location, note, date, time} = inputFromUser;
        const amountI = parseInt(amount);
        try {
            await pool.query(`insert into 
            allform(id_usr, type_of_form, id_private_form, odometer, type_of_expense, amount, location, note, date, time)
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`
            , [id_usr, type_of_form, id_private_form, odometer, type_of_expense, amountI, location, note, date, time]);

        } catch (err) {
            console.log({message: 'failed at _all_form_insert_chiphi', err});
        }
    },

    _all_form_insert_dichvu: async (id_usr, type_of_form, id_private_form, inputFromUser) => {
        //Step 1: Extract Input From User Data
        const {odometer, type_of_service, amount, location, note, date, time} = inputFromUser;

        //Step 2: Amount in Postgres is INT type but here Amount is JSON form => We convert Stirng to Int
        const amountI = parseInt(amount);

        try {
            await pool.query(`insert into 
            allform (id_usr, type_of_form, id_private_form, odometer, type_of_service, amount, note, location, date, time)
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [id_usr, type_of_form, id_private_form, odometer, type_of_service, amountI, note, location, date, time]);

        } catch (err) {
            console.log({message: 'failed at All_Form_Dich_Vu', err});
        }
    },

    _all_form_insert_thunhap: async (id_usr, type_of_form, id_private_form, inputFromUser) => {

        //Step 1: Extract Input From User data
        const {odometer, type_of_income, amount, note, location, date, time} = inputFromUser;

        //Step 2: Amount in PostgreSQL is INT type but here Amount is JSON Form => We need to convert String to INT
        const amountI = parseInt(amount);

        try {
            console.log({data: inputFromUser})
            await pool.query(`insert into 
            allform(id_usr, type_of_form, id_private_form, odometer, type_of_income, amount, note, location, date, time)
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
            ,[id_usr, type_of_form, id_private_form, odometer, type_of_income, amountI, note, location, date, time]);

        } catch (err) {
            console.log({message: 'Failed in all_form_insert_ThuNhap', err});
        }
    },

    _return_id_form_detail: () => {

    }
}