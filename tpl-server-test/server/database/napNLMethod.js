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

    print: async (usr_id) => {
        try {
            const query = await pool.query(`
            SELECT nnl.id, nnl.odometer, lnl.name as type_of_fuel, nnl.price_per_unit, nnl.total_cost, nnl.total_units, tx.name as gas_station, ld.name as reason, nnl.date, nnl.time
            FROM napnhienlieu as nnl
            INNER JOIN loainhienlieu as lnl
                ON nnl.type_of_fuel = lnl.id
            INNER JOIN tramxang as tx
                ON nnl.gas_station = tx.id
            LEFT JOIN lydo as ld
                ON nnl.reason = ld.id
            WHERE nnl.u_id = $1
            ORDER BY nnl.date desc, nnl.time desc
            `, [usr_id]);
            const napnhienlieu_arr = query.rows;
            //console.table(napnhienlieu_arr);
            return napnhienlieu_arr;
        } catch (err) {
            throw new Error(err);
        }
    },

    insert: async (form_id,user_id,inputFromClient) => {

        //deliberately omit the reason field by not inserting it

        // remember to send 'reason' as a number | This is a new variable xxw
        const {date, time, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, gas_station} = inputFromClient;
        const odometerF = parseFloat(odometer);
        const price_per_unitI = parseInt(price_per_unit);
        const total_costI = parseInt(total_cost);
        const total_unitsF = parseFloat(total_units);
        //change text to boolean
        
        //type_of_fuel now accepts an INT8-typed NUMBER instead of a TEXT-typed VALUE
        //gas_station accepts an INT8-typed NUMBER
        //Reason now accepts an INT8-typed NUMBER instead of a TEXT-typed VALUE
        const type_of_fuelBI = BigInt(type_of_fuel);
        const gas_stationBI = BigInt(gas_station);
        //const reasonBI = BigInt(reason);

        try{
            await pool.query(`
            INSERT INTO napnhienlieu(id, u_id, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, gas_station, date, time)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
            , [form_id, user_id, odometerF,  type_of_fuelBI, price_per_unitI, total_costI, total_unitsF, full_tank, gas_stationBI, date, time]);
        } catch (err) {
            throw new Error(err);
        }
    },

    //yet changed 'location' to 'gas_station'
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

    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM napnhienlieu WHERE u_id = $1 AND id = $2 `, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2`, [usr_id, form_id]);
        } catch (err) {
            throw new Err(err);
        }
    },

   _startDay_and_currentDay_refilling_time_precision: async (usr_id) => {
       try {

            const query0 = await pool.query(`
            SELECT count(id) as number_of_rows 
            FROM napnhienlieu
            WHERE u_id = $1
            `, [usr_id]);
            const total_entry_nll = parseInt(query0.rows[0].number_of_rows);

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
 
            let date_part = query2.rows[0].date_part; //INT
            date_part === 0 ? date_part = 1 : date_part = date_part + 1;

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

            // Nghia la chi co 1 form duoc nhap => khong the tinh trung binh quang duong da di va cac thu khac
            if (query3.rowCount === 1) {
                // lay gia tri total_cost va total_units cua form duy nhat do
                const query4 = await pool.query(`
                SELECT total_cost, total_units
                FROM napnhienlieu
                WHERE u_id = $1
                `, [usr_id]);
                const total_cost = query4.rows[0].total_cost;
                const total_unit = parseFloat(query4.rows[0].total_units);
                return { 
                    total_entry_nll,
                    start_date,
                    current_date,
                    date_part: 0, //use to compute by_day
                    total_odometer_moved: 0.0, //use to compute by_km
                    cost: {
                        total_cost: total_cost,
                        by_day: total_cost,
                        by_km: 0.000,
                    },
                    fuel: {
                        total_volume: `${total_unit} L`,
                        general_average: `NaN km/L`,
                    }
                };

            } else { // Vao else duoc => co nhieu hon hoac bang 2 forms 
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
                    total_entry_nll,
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
            }
       } catch (err) {
           console.log('Failed at _startDay_and_currentDay_refilling_time_precision in napNLMethod.js');
           throw new Error('failed at _startDay_and_currentDay_refilling_time_precision');
       }

    }
}