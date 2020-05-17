const pool = require('./pooling');

module.exports = {
    getAll: async (req,res) => {
        try {
            const results = await pool.query('select * from chiphi');
            return res.status(200).send(results.rows);
        }
        catch (err) {
            return res.sendStatus(403);
        }
    },
    insert: async (req,res) => {
        try {
            await pool.query(`insert into chiphi(Type_of_expense, Location, Reason) 
            values ('food booking', 'Trung Chanh', 'Have no reason' )`);
            return res.sendStatus(200);
        }
        catch (err) {
            return res.sendStatus(403);
        }
        
    }
}