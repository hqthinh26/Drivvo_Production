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

    insert: async (inputFromClient, u_id) => {
        const {odometer, type_of_income, amount, note} = inputFromClient;

        //convert odometer(string) to odometerF(Float)
        const odometerF = parseFloat(odometer);

        //convert amount(string) to amontI(Integer)
        const amountI = parseInt(amount);

        await pool.query(`insert into thunhap(u_id, odometer, type_of_income, amount, note) 
        values ($1,$2,$3,$4,$5)`, [u_id,odometerF, type_of_income, amountI, note]);
    }
};