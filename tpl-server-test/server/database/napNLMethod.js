const pool = require('./pooling');
const { query } = require('./pooling');

const calculate_total_cost_and_unit = async (usr_id) => {
    const query1 = await pool.query(`SELECT total_cost, total_units
                                FROM napnhienlieu
                                WHERE u_id = $1`
    ,[usr_id]);
    const array_query1 = query1.rows; //[{total_cost, total_units}, {total_cost, total_units}, {total_cost, total_units}, ....]
    const rowCount = query1.rowCount;

    let total_cost = 0; total_unit = 0.00; 

    for(let i=0; i< rowCount; i++){
        total_cost = total_cost + array_query1[i].total_cost;
        total_unit = total_unit + parseFloat(array_query1[i].total_units); //becuz the data_type of total_unit is string
        // so you need to convert it to the float_type to do the computation
    }
    return {total_cost, total_unit};
}

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

   _startDay_and_currentDay_refilling_time_precision: async (usr_id) => {
       try {
            const query1 = await pool.query(`
            SELECT min(date)as start_date, max(date) as current_date
            FROM napnhienlieu
            WHERE u_id = $1
            `,[usr_id]);
        
            const start_date = query1.rows[0].start_date;
            const current_date = query1.rows[0].current_date;

            const query2 = await pool.query(`
            SELECT DATE_PART('day', $1::timestamp - $2::timestamp)
            `, [current_date, start_date]);
 
            const date_part = query2.rows[0].date_part; //INT

            //Query 3 will return 2 rows | the first is for the lowest value odometer
            // The second is for the highest value odometer
            const query3 = await pool.query(`
            (SELECT odometer
            FROM napnhienlieu
            WHERE (u_id = $1) AND (date = $2) AND (time = (SELECT min(time)
                                                            FROM napnhienlieu
                                                            WHERE (u_id = $1 AND date = $2)
                                                        )
                                                ))
            UNION
            (SELECT odometer
            FROM napnhienlieu
            WHERE (u_id = $1) AND (date = $3) AND (time = (SELECT max(time)
                                                            FROM napnhienlieu
                                                            WHERE (u_id = $1 AND date = $3)
                                                        )
                                                ))
            ORDER BY odometer ASC
            `, [usr_id, start_date,current_date]); 

            const odometer_on_start_date = query3.rows[0].odometer;
            const odometer_on_current_date = query3.rows[1].odometer;
            
            //convert string to float
            const odometer_on_start_dateF = parseFloat(odometer_on_start_date);
            const odometer_on_current_dateF = parseFloat(odometer_on_current_date);
            const total_odometer_moved = odometer_on_current_dateF - odometer_on_start_dateF;

            const  {total_cost, total_unit} = await calculate_total_cost_and_unit(usr_id);
            
            const by_day_cost = parseFloat((total_cost / date_part).toFixed(3));
            const by_km_cost =  parseFloat((total_cost / total_odometer_moved).toFixed(3));
            const km_per_litter = parseFloat((total_odometer_moved / total_unit).toFixed(3));

            return {
                start_date, 
                current_date, 
                date_part, //use to compute by_day
                total_odometer_moved, //use to compute by_km
                cost: {
                    total_cost,
                    by_day: by_day_cost,
                    by_km: by_km_cost,
                },
                fuel: {
                    total_volume: `${total_unit} L`,
                    general_average: `${km_per_litter} km/L`,
                }
            };
       } catch (err) {
           console.log('Failed at _startDay_and_currentDay_refilling_time_precision in napNLMethod.js');
           throw new Error('failed at _startDay_and_currentDay_refilling_time_precision');
       }

    }
}