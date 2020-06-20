const pool = require('./pooling');

const entry_current_date = async (usr_id) => {
    const entry_date_query = await pool.query(`SELECT min(created_at_date) as start_date, max(created_at_date) as current_date 
                                     FROM history
                                     WHERE usr_id = $1`,[usr_id]);
    const start_and_current_date = {start_date,current_date} = entry_date_query.rows[0]; //the result.rows[0] format: {start_day, current_day}
    
    const date_diff_query = await pool.query(`SELECT DATE_PART('day', $1::timestamp - $2::timestamp)`, [current_date, start_date]);
    const date_diff = date_diff_query.rows[0];
    return {start_and_current_date, date_diff};
};

const calculation = (list_of_total_costs_units) => {
    const cost_array = list_of_total_costs_units.map((eachRow) => eachRow.total_cost);
    const unit_array = list_of_total_costs_units.map(eachRow => parseFloat(eachRow.total_units));
    
    let total_cost = 0, total_units = 0.00;
    for (let i = 0; i < cost_array.length; i++){
        total_cost = total_cost + cost_array[i];
        total_units = total_units + unit_array[i];
    }
    return {total_cost, total_units}
}

module.exports = {

    report_NLL: async (usr_id) => {
        try {

            const data = {start_and_current_date, date_diff} = await entry_current_date(usr_id);

            const list_of_total_costs_units_query = await pool.query(`SELECT  total_cost, total_units from napnhienlieu
                                                                      WHERE u_id = $1`, [usr_id]);
            const list_of_total_costs_units = list_of_total_costs_units_query.rows;
            
            const {total_cost, total_units} = calculation(list_of_total_costs_units);

            return {data, total_cost, total_units}
        } catch (err) {
            throw new Error('Failed at report_NLL in reportMethod.js');
        }
    }
};