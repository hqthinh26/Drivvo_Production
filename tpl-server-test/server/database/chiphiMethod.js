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

        await pool.query(`
            insert into chiphi (id, u_id, odometer, type_of_expense, amount, location, note, date, time) 
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `, [chiphi_id, usr_id, odometerF, type_of_expense, amountI, location, note, date, time]);
        
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

}