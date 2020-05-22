const pool = require('./pooling');

module.exports = {
    printall: async (req,res) => {
        try {
            const results = await pool.query(`select * from dichvu`);
            res.status(200).send(results.rows);
        } catch (err) {
            res.sendStatus(403);
        }
    },

    insert: async (inputFromClient, u_id) => {
        const {date, time, dometer, type_of_service, amount, location, note} = inputFromClient;
        
        console.log(inputFromClient);
        //conver odometer(string) to odometerF(float)
        const odometerF = parseFloat(odometer);
        console.log(amount);
        //convert amount(string) to amountI(Integer)
        const amountI = parseInt(amount);
    
        await pool.query(`insert into dichvu (u_id, date, time, odometer, type_of_service, amount, location, note)
            values ($1,$2,$3,$4,$5,$6,$7,$8)`
            , [u_id, date, time, odometerF, type_of_service, amountI, location, note]);
    }
}

