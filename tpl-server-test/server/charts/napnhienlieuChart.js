const pool = require('../database/pooling');

const _current_year = async () => {
    const query1 = await pool.query(`SELECT EXTRACT(YEAR FROM now()) as year`);
    return query1.rows[0].year;
}
// ================================== CHART 1 Total spent for each type_of_fuel ===================================
const _start_current_dates = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT min(created_at_date) as start_date, max(created_at_date) as current_date
    FROM history
    WHERE usr_id = $1
    `, [usr_id]);
   return query1.rows[0];
};

const _main_function_chart_1 = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT lnl.name as type_of_fuel, sum(nll.total_cost) as total_amount
    FROM napnhienlieu as nll, loainhienlieu as lnl
    WHERE (lnl.usr_id = $1) AND (nll.type_of_fuel = lnl.id)
    GROUP BY lnl.name
    `,[usr_id]);
    const query1_result = query1.rows.map(
        (each_row) => ({
            ...each_row,
            total_amount: parseInt(each_row.total_amount),
        })
    );
    return query1_result;
}

// ================================== CHART 2 - Monthy Odometer Chart ===================================
const _main_fucntion_chart_2 = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT min(odometer) as start_odometer
    FROM napnhienlieu 
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2`
    ,[usr_id, current_year]);
    const start_odometer = query1.rows[0].start_odometer;

    const query2 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, max(odometer) as max_odometer_each_month
    FROM napnhienlieu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    `,[usr_id, current_year]);
    const max_odometer_each_month_array = query2.rows.map(
        (each_row) => ({
            ...each_row,
            max_odometer_each_month: parseFloat(each_row.max_odometer_each_month),
        })
    );

    return {start_odometer, max_odometer_each_month_array}
}

// ================================== CHART 3 - Monthy Fuel Price Chart ===================================
const _main_function_chart_3 = async (usr_id, current_year) => {

    //query 1 returns a list of all price_per_unit in rows ORDERED BY MONTH
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, price_per_unit
    FROM napnhienlieu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date), price_per_unit
    ORDER BY month asc
    `,[usr_id, current_year]);
    
    const query2 = await pool.query(`
    SELECT DISTINCT EXTRACT(MONTH FROM date) as available_month
    FROM napnhienlieu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    ORDER BY available_month asc
    `,[usr_id, current_year]);

    const price_per_unit_rows = query1.rows; // [{month,price_per_unit}, {month,price_per_unit}]

    // [{available_moth}, {available_month}] //each month is a unique number
    const available_months = query2.rows.map((each_row) => each_row.available_month); 

    const average_price_per_unit_by_month = available_months.map(
        (each_unique_month) => {

            let average = 0;
            let count = 0;
            price_per_unit_rows.forEach(
                (each_row) => {
                    if(each_row.month === each_unique_month){
                        count++;
                        average = average + each_row.price_per_unit;
                    }
                }
            );
            return {
                month: each_unique_month, 
                average_price_per_unit: parseFloat((average/count).toFixed(3)), //find this something
            };
        }
    );

    return {average_price_per_unit_by_month};
};

// ================================== CHART 4 - Monthly Expenditure for Refuelling Chart ===================================

const _main_function_chart_4 = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(total_cost) as monthly_cost
    FROM napnhienlieu
    WHERE u_id = $1 AND (EXTRACT(YEAR FROM date) = $2)
    GROUP BY EXTRACT(MONTH FROM date)
    `, [usr_id, current_year]);
    return query1.rows;
}

module.exports = {
    chart_1: async (usr_id) => {
        const start_current_dates = await _start_current_dates(usr_id);
        const data = await _main_function_chart_1(usr_id);
        return {start_current_dates, data};
    },

    chart_2: async (usr_id) => {
        const start_current_dates = await _start_current_dates(usr_id);
        const current_year = await _current_year();
        const data = await _main_fucntion_chart_2(usr_id, current_year);
        return {start_current_dates, current_year, data}
    },

    chart_3: async (usr_id) => {
        const start_current_dates = await _start_current_dates(usr_id);
        const current_year = await _current_year(usr_id);
        const data = await _main_function_chart_3(usr_id, current_year);
        return {start_current_dates, current_year, data};
    },

    chart_4: async (usr_id) => {
        const start_current_dates = await _start_current_dates(usr_id);
        const current_year = await _current_year();
        const data = await _main_function_chart_4(usr_id, current_year);
        return {start_current_dates, current_year, data};
    }
}