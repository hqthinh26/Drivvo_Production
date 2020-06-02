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
        try {
            await pool.query(`insert into thunhap(id, u_id, date, time, odometer, type_of_income, amount, note) 
        values ($1,$2,$3,$4,$5,$6,$7,$8)`, [thunhap_id, usr_id, date, time, odometerF, type_of_income, amountI, note]);
        } catch (err) {
            console.log({message: 'failed at thunhap insert method', err});
        }
        
    }
};