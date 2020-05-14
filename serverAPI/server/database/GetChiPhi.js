const pool = require('./pooling');

module.exports = {
    getAllChiPhi: async (req,res) => {
        const result = await pool.query("select * from chiphi");
        console.log(result)
        res.status(200).send({all: result.rows});
    },
    getProducts: async (req,res) => {
        const result = await pool.query("select * from products");
        console.log('failed')
        res.status(200).send({result: result.rows});
    }
}