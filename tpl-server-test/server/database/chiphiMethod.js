const pool = require('./pooling');

module.exports = {
    printall: async (req,res) => {
        try {
            const results = await pool.query('select * from chiphi');
            return res.status(200).send(results.rows);
        }
        catch (err) {
            return res.sendStatus(403);
        }
    },

    insert: async (chiphi_id, usr_id, inputFromClient) => {
        const {odometer,type_of_expense, amount, location, note, date, time, } = inputFromClient;
        const odometerF = parseFloat(odometer);
        const amountI = parseInt(amount);
        console.log(odometer);

        await pool.query(`
            insert into chiphi (id, u_id, odometer, type_of_expense, amount, location, note, date, time) 
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `, [chiphi_id, usr_id, odometerF, type_of_expense, amountI, location, note, date, time]);
        
    }

    /*insert: async (req,res) => {
        try {
            await pool.query(`insert into chiphi(Type_of_expense, Location, Reason);
            values ('food booking', 'Trung Chanh', 'Have no reason' )`);
            return res.sendStatus(200);
        }
        catch (err) {
            return res.sendStatus(403);
        }
        
    }*/

}