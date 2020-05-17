const pool = require('./pooling');

module.exports = {
    insert: async (req,res) => {
        const x = {odometer, type_of_fuel, price_per_unit, total_cost, unit_amount, full_tank, destination} = req.body;
        console.log(x);
        try{
            await pool.query(`insert into napnhienlieu(odometer, type_of_fuel, price_per_unit, total_cost, unit_amount, full_tank, destination)
        values ($1,$2,$3,$4,$5,$6,$7)`, [odometer,type_of_fuel,price_per_unit,total_cost,unit_amount,full_tank,destination]);
            res.send("Successful");
        } catch (err) {
            res.sendStatus(403);
        }
    },
    printall: async (req,res) => {
        const result = await pool.query("select * from napnhienlieu");
        res.send(result.rows);
    },
}