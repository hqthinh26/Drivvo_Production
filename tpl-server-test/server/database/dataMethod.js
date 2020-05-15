const pool = require('./pooling');

module.exports = {
    login: async (req,res) => {
        const result = await pool.query("select * from logindata");
        res.send({results: result.rows});
    },
    getNapNhienLieu: async (req,res) => {
        const result = await pool.query("select * from napnhienlieu");
        res.send(result.rows);
    }
    
}