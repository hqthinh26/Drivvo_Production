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

    insert: async (dichvu_id, usr_id, inputFromClient) => {
        const {odometer, type_of_service, amount, location, note, date, time} = inputFromClient;
        console.log({dichvuMethod:inputFromClient});

        const odometerF = parseFloat(odometer);
        const amountI = parseInt(amount);
    
        await pool.query(`insert into dichvu (id, u_id, date, time, odometer, type_of_service, amount, location, note)
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
            , [dichvu_id, usr_id, date, time, odometerF, type_of_service, amountI, location, note]);
    }
}

