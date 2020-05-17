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
};