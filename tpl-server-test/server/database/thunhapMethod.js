const pool = require('./pooling');

module.exports = {
    printall: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT tn.id, tn.odometer, lnl.name as type_of_income, tn.amount, tn.note , tn.date, tn.time
            FROM thunhap as tn
            INNER JOIN loainhienlieu as lnl
            ON tn.type_of_income = lnl.id
            WHERE tn.u_id = $1
            ORDER BY date desc, time desc
            `, [usr_id]);
            const thunhap_arr = query1.rows;
            return thunhap_arr;
        } catch (err) {
            throw new Error(err);
        }
    },

    insert: async (thunhap_id, usr_id, inputFromClient) => {
        const {odometer, type_of_income, amount, note, date, time} = inputFromClient;

        //convert odometer(string) to odometerF(Float)
        const odometerF = parseFloat(odometer);

        //convert amount(string) to amontI(Integer)
        const amountI = parseInt(amount);

        //type_of_income is INT8-typed value => converting FROM STRING to BIGINT
        const type_of_incomeBI = BigInt(type_of_income);
        try {
            await pool.query(`insert into thunhap(id, u_id, date, time, odometer, type_of_income, amount, note) 
            values ($1,$2,$3,$4,$5,$6,$7,$8)`, [thunhap_id, usr_id, date, time, odometerF, type_of_incomeBI, amountI, note]);
        } catch (err) {
            throw new Error(err);
        }   
    },

    // yet modified type_of_income
    _update: async (form_id, inputFromUser) => {
        const {odometer, type_of_income, amount, note, time, date}
        = inputFromUser;
        const odometerF = parseFloat(odometer);
        const amountI = parseInt(amount);

        try {
            await pool.query(`update thunhap
            set odometer = $1, type_of_income = $2, amount = $3, note = $4, time = $5, date = $6
            where id = $7`, [odometerF, type_of_income, amountI, note, time, date, form_id]);

        } catch (err) {
            console.log({err});
            return err;
        }
    },
    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM thunhap WHERE u_id = $1 AND id = $2`, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2`, [usr_id, form_id]);
        } catch (err) {
            throw new Error(err);
        }
    }
};