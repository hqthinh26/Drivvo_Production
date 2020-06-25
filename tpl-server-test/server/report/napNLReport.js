const pool = require('../database/pooling')
const napNLMethod = require('../database/napNLMethod');

const entryDay_and_currentDay = async (usr_id) => {
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


module.exports = {

    report_NLL: async (usr_id) => {
        try {

            const {total_entry, start_date_general, current_date_general, date_diff_general} = await entryDay_and_currentDay(usr_id); //entry & date_diff

            const query1 = await pool.query(`SELECT  total_cost, total_units from napnhienlieu
                                            WHERE u_id = $1`, [usr_id]);

            const list_of_total_costs_unit = query1.rows;
            
            const {total_cost, total_unit} = get_total_cost_unit(list_of_total_costs_unit); // total_cost & total_unit


           const related_values_nll = await napNLMethod._startDay_and_currentDay_refilling_time_precision(usr_id);
 
            return {
                    Entry: {total_entry ,start_date_general, current_date_general, date_diff_general},
                    related_values_nll,
                    
            };
        } catch (err) {
            console.log({Err: err});
            throw new Error('Failed at report_NLL in reportMethod.js');
        }
    }
};