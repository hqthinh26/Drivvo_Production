const pool = require('./pooling');

module.exports = {
    printall: async (req,res) => {
        try {
            const results = await pool.query(`select * from thunhap`);
            res.status(200).send(results.rows);
        }
        catch (err) {
            res.sendStatus(403);
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
            throw new Error({message: 'failed at insert thunhapMethod', ERR: err});
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
    }
};