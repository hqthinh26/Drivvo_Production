const pool = require('../database/pooling')

//From database folder
const napNLMethod = require('../database/napNLMethod');

//From report folder
const napNLReport = require('./fuel_efficiency');

const entryDay_and_currentDay = async (usr_id) => {
    const query1_count_row = await pool.query(`
    SELECT count(id) as row_count
    FROM napnhienlieu
    WHERE u_id = $1 `, [usr_id]);
    const row_count = parseInt(query1_count_row.rows[0].row_count);
    if(row_count === 0) {
        return {total_entry: 0, start_date_general: '', current_date_general: '', date_diff: 0}
    }
    const entry_date_query = await pool.query(`SELECT min(created_at_date) as start_date_general, max(created_at_date) as current_date_general 
                                     FROM history
                                     WHERE usr_id = $1`,[usr_id]);
    const  {start_date_general,current_date_general} = entry_date_query.rows[0]; //the result.rows[0] format: {start_day, current_day}
    
    const date_diff_query = await pool.query(`SELECT DATE_PART('day', $1::timestamp - $2::timestamp)`, [current_date_general, start_date_general]);
    const date_diff_general = date_diff_query.rows[0].date_part;

    const query2 = await pool.query(`select count(id) as total_entry from history where usr_id = $1`, [usr_id]);
    const total_entry = parseInt(query2.rows[0].total_entry);

    return {total_entry, start_date_general, current_date_general, date_diff_general};
};

const get_total_cost_unit = (list_of_mixed_total_costs_unit_from_napnhienlien) => {

    //list_of_total_costs_unit = [ {total_cost, total_units }, {total_cost, total_units }, { total_cost, total_units }, ...]

    const mixed_array = list_of_mixed_total_costs_unit_from_napnhienlien;

    const cost_array = mixed_array.map((eachRow) => eachRow.total_cost);
    const unit_array = mixed_array.map(eachRow => parseFloat(eachRow.total_units));
    
    let total_cost = 0, total_unit = 0.00;
    for (let i = 0; i < cost_array.length; i++){
        total_cost = total_cost + cost_array[i];
        total_unit = total_unit + unit_array[i];
    }
    return {total_cost, total_unit}
}

const find_individual_odometer_value = async (each_history_form_value) => {
    const {type_of_form, id_private_form} = each_history_form_value;

    if(type_of_form === 'napnhienlieu') {
        const result = await pool.query(`select odometer from napnhienlieu where id = $1`, [id_private_form])
        return result.rows[0].odometer;
    }
    throw new Error('failed at find_value_odometer');
}

const count_row = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT count(id) as total_row
    FROM napnhienlieu
    WHERE u_id = $1`, [usr_id]);
    return parseInt(query1.rows[0].total_row);
}

const today = async () => {
    const query1 = await pool.query(`SELECT date_trunc('day', now()) as today`);
    return query1.rows[0].today;
}
module.exports = {

    report_NLL: async (usr_id) => {
        try {

            const number_of_row = await count_row(usr_id);

            //there are 3 cases that either happens
            //Napnhienlieu table has 0 form
            // napnhien lieu table has 1 form
            // napnhienlieu table has multiple forms

            if( number_of_row === 0) {
                const todayy = await today();
                return {
                    related_values_nll: {
                        total_entry_nll: number_of_row,
                        start_date: todayy,
                        current_date: todayy,
                        date_part: 0, //use to compute by_day
                        total_odometer_moved: 0, //use to compute by_km
                        cost: {
                            total_cost: 0,
                            by_day: 0.000,
                            by_km: 0.000,
                        },
                        fuel: {
                            total_volume: `0 L`,
                            general_average: `0 km/L`,
                        }
                    },
                    fuel_efficiency: {
                        latest: {id: '0', average: 0},
                        min: {id: '0', average: 0},
                        max: {id: '0', average: 0},
                    } 
                };
            }

            if (number_of_row === 1) {
                //Values are calculted and returned in napNLMethod.js File
                //This condition just maps and returns the value to users.
                const {
                    start_date,
                    current_date,
                    total_odometer_moved,
                    cost,
                    fuel,
                } = await napNLMethod._startDay_and_currentDay_refilling_time_precision(usr_id);
                return {
                    related_values_nll: {
                        total_entry_nll: number_of_row,
                        start_date: start_date,
                        current_date: current_date,
                        date_part: 1, 
                        total_odometer_moved: total_odometer_moved, 
                        cost: cost,
                        fuel: fuel,
                    },
                    fuel_efficiency: {
                        latest: {id: '0', average: 0},
                        min: {id: '0', average: 0},
                        max: {id: '0', average: 0},
                    } 
                };
            }
            
            const query1 = await pool.query(`SELECT  total_cost, total_units from napnhienlieu
                                            WHERE u_id = $1`, [usr_id]);

            const {total_cost, total_unit} = get_total_cost_unit(query1.rows); // total_cost & total_unit


           const related_values_nll = await napNLMethod._startDay_and_currentDay_refilling_time_precision(usr_id);

           const {average_array, latest, min, max} = await napNLReport.print_fuel_efficiency(usr_id);
 
            return {
                    related_values_nll,
                    fuel_efficiency: {
                        latest,
                        min,
                        max
                    }
            };
        } catch (err) {
            console.log({Err: err});
            throw new Error('Failed at report_NLL in reportMethod.js');
        }
    }
};