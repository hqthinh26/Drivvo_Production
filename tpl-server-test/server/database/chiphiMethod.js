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

    insert: async (inputFromClient,u_id) => {
        const {odometer,type_of_expense, location, reason} = inputFromClient;
        const odometerF = parseFloat(odometer);
        console.log(odometer);

        await pool.query(`
            insert into chiphi (u_id, odometer, type_of_expense, location, reason) 
            values ($1,$2,$3,$4,$5)
        `, [u_id, odometerF, type_of_expense, location, reason]);
        
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