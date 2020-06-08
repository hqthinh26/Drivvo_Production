const pool = require('./pooling');

module.exports = {
    insert: async (form_id,user_id,inputFromClient) => {
        const {date, time, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location} = inputFromClient;
        const odometerF = parseFloat(odometer);
        const price_per_unitI = parseInt(price_per_unit);
        const total_costI = parseInt(total_cost);
        const total_unitsF = parseFloat(total_units);
        //change text to boolean
        
        try{
            await pool.query(`insert into napnhienlieu(id, u_id, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location,  date, time)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
        , [form_id, user_id, odometerF,  type_of_fuel, price_per_unitI, total_costI, total_unitsF, full_tank, location, date, time]);
        } catch (err) {
            throw new Error('Failed to insert NapNL');
        }
    },

    _update: async (form_id, inputFromUser) => {
        const {odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location, time, date} = inputFromUser;
        const odometerF = parseFloat(odometer);
        const price_per_unitI = parseInt(price_per_unit);
        const total_costI = parseInt(total_cost);
        const total_unitsF = parseFloat(total_units);

        try {
            await pool.query(`update napnhienlieu 
            set odometer = $1, type_of_fuel = $2, price_per_unit = $3, total_cost = $4, total_units = $5, full_tank = $6, location = $7, time = $8, date = $9
            where id = $10`, [odometerF, type_of_fuel, price_per_unitI, total_costI, total_unitsF, full_tank, location, time, date, form_id]);
        } catch (err) {
            throw new Error('Failed at update napNL method');
        }
    },

    printall: async (req,res) => {
        const result = await pool.query("select * from napnhienlieu");
        res.send(result.rows);
    },
}