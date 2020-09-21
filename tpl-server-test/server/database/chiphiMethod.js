const pool = require('./pooling');

module.exports = {
    print: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT cp.id, cp.odometer, lcp.name as type_of_expense, cp.amount, dd.name as place, ld.name as reason, cp.note, cp.date, cp.time
            FROM chiphi as cp
            INNER JOIN loaichiphi as lcp
                ON cp.type_of_expense = lcp.id
            INNER JOIN diadiem as dd
                ON cp.place = dd.id
            LEFT JOIN lydo as ld
                ON cp.reason = ld.id
            WHERE cp.u_id = $1 
            ORDER BY cp.date desc, cp.time desc
            `, [usr_id]);
            const chiphi_arr = query1.rows;
            return chiphi_arr;
        } catch (err) {
            throw new Error(err);
        }
    },

    insert: async (chiphi_id, usr_id, inputFromClient) => {
        try {
            // place accepts a INT8-typed NUMBER as it's referencing to diadiem table, which contains the location string.
            const {odometer,type_of_expense, amount, place, note, reason, date, time} = inputFromClient;
            const odometerF = parseFloat(odometer);
            const amountI = parseInt(amount);

            // type_of_expense, place, reason are INT8-typed NUMBERS 
            // => converting from STRING to BIGINT
            console.log('======== INPUT VALUE - CHI PHI============');
            console.table(inputFromClient);

            const type_of_expenseBI = BigInt(type_of_expense);
            const placeBI = BigInt(place);
            const reasonBI = reason === null  ? null : BigInt(reason);

            console.log({reason, reasonBI});

            console.log('\n============================');

            await pool.query(`
                insert into chiphi (id, u_id, odometer, type_of_expense, amount, place, reason, note, date, time) 
                values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            `, [chiphi_id, usr_id, odometerF, type_of_expenseBI, amountI, placeBI, reasonBI, note, date, time]);
            
        } catch (err) {
            throw new Error(err);
        }
    },
    
    //Only need the id of that specific form and the data needs to replace the old
    _update: async (form_id, inputFromUser) => {
        const {odometer, type_of_expense, amount, location, note, time, date} = inputFromUser;

        const odometerF = parseFloat(odometer);
        const amountI = parseInt(amount);

        try {
            await pool.query(`update chiphi 
            set odometer = $1, type_of_expense = $2, amount = $3, location = $4, time = $5, date = $6
            where id = $7`, [odometerF, type_of_expense, amountI, location, time, date, form_id]);
        } catch (err) {
            throw new Error('Failed in update chiphi');
        }
    },

    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM chiphi WHERE u_id = $1 AND id = $2 `, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2`, [usr_id, form_id]);
        } catch (err) {
            throw new Err(err);
        }
    }

}