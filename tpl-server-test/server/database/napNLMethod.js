const pool = require('./pooling');
const {uuid} = require('uuidv4');

module.exports = {
    //@ts-ignore
    insert: async (inputFromClient,user_id) => {
        const local_UUID = uuid();
        const {date, time, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location} = inputFromClient;
        const odometerF = parseFloat(odometer);
        const price_per_unitI = parseInt(price_per_unit);
        const total_costI = parseInt(total_cost);
        const total_unitsF = parseFloat(total_units);
        //change text to boolean
        
        try{
            await pool.query(`insert into napnhienlieu(id, date, time, odometer, u_id, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
        , [local_UUID, date, time, odometerF, user_id, type_of_fuel, price_per_unitI, total_costI, total_unitsF, full_tank, location]);
        } catch (err) {
            throw new Error('Failed to insert NapNL');
        }
    },

    // @ts-ignore
    printall: async (req,res) => {
        const result = await pool.query("select * from napnhienlieu");
        res.send(result.rows);
    },
}