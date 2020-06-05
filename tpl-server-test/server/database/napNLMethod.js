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
            await pool.query(`insert into napnhienlieu(id, date, time, odometer, u_id, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
        , [form_id, date, time, odometerF, user_id, type_of_fuel, price_per_unitI, total_costI, total_unitsF, full_tank, location]);
        } catch (err) {
            throw new Error('Failed to insert NapNL');
        }
    },

    _update: async (form_id,new_location) => {
        console.log('im updating')
        try {
            await pool.query(`update napnhienlieu set location = $1 where id = $2`, [new_location, form_id]);
        } catch (err) {
            console.log({message: 'Failed at Update NLL', err});
            throw new Error(err);
        }
    },

    printall: async (req,res) => {
        const result = await pool.query("select * from napnhienlieu");
        res.send(result.rows);
    },
}