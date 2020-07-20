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
            name: each_row.type_of_fuel,
            population: parseInt(each_row.total_amount),
        })
    );
    return query1_result;
}

// ================================== CHART 2 - Monthy Odometer Chart ===================================
const _main_fucntion_chart_2 = async (usr_id, current_year) => {
    // const query1 = await pool.query(`
    // SELECT min(odometer) as start_odometer
    // FROM napnhienlieu 
    // WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2`
    // ,[usr_id, current_year]);
    // const start_odometer = query1.rows[0].start_odometer;

    const query2 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, max(odometer) as max_odometer_each_month
    FROM napnhienlieu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    `,[usr_id, current_year]);

    let label = [];
    let data = [];
    query2.rows.forEach(
        (each_month) => {
            label.push(each_month.month);
            data.push(parseFloat(each_month.max_odometer_each_month));
        }
    );


    return {label, data}
}

// ================================== CHART 3 - Monthly Average Fuel Price =================================

const _main_function_chart_3 = async (usr_id, current_year) => {

    //Return an array of price_per_unit ORDER BY type_of_fuel
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, lnl.name, nll.price_per_unit
    FROM napnhienlieu as nll, loainhienlieu as lnl
    WHERE (nll.u_id = $1) AND (EXTRACT(YEAR FROM date) = $2) AND (nll.type_of_fuel = lnl.id) AND (EXTRACT(YEAR FROM date) = $2)
    GROUP BY EXTRACT(MONTH FROM date), lnl.name, nll.price_per_unit
    ORDER BY month asc, lnl.name asc, nll.price_per_unit asc
    `, [usr_id, current_year])


    //array_of_main_data = [{month, name, price_per_unit}, {}, {}, ...]
    const array_of_main_data = query1.rows;


    // DISTINCTLY return Names of months in napnhienlieu table in the current year
    const query2 = await pool.query(`
    SELECT DISTINCT EXTRACT(MONTH FROM date)  as month
    FROM napnhienlieu
    WHERE (u_id = $1) AND (EXTRACT(YEAR FROM date) = $2)
    `,[usr_id, current_year]);

    //array_of_current_months = [1,2,3,4,5,6,...]
    const array_of_current_months = query2.rows.map(
        (each_row) => each_row.month
    );

    // DISTINCTLY return Names of used type_of_fuel in napnhienlieu table
    const query3 = await pool.query(`
    SELECT DISTINCT lnl.name as name
    FROM napnhienlieu as nll, loainhienlieu as lnl
    WHERE (nll.type_of_fuel = lnl.id) AND (nll.u_id = $1) AND (EXTRACT(YEAR FROM date) = $2)
    `, [usr_id, current_year]);
    
    //array_of_used_type_of_fuel = ['gasoline','electricity',....]
    const array_of_used_type_of_fuel = query3.rows.map(
        (each_row) => each_row.name
    );

    const data_array = array_of_current_months.map(
        (each_month) => {
            const tmp_data_array = array_of_main_data.filter(
                (month_in_main_data) => month_in_main_data.month === each_month
            );
            const test = array_of_used_type_of_fuel.map(
                (each_type) => {
                    let count = 0; let total = 0; let average = 0.000;
                    tmp_data_array.forEach(
                        (for_each_value) => {
                            if(for_each_value.name === each_type) {
                                count++;
                                total = total + for_each_value.price_per_unit;
                            }
                            average = parseFloat((total / count).toFixed(3));
                            
                        }
                    );
                    count === 0 ? average = 0.000 : average;
                    return average;
                }
            );
            return test; //[x,y]
        }
    )
    /*
    month: [1,2,3,4,7], 
    used_type_of_form: [gasoline, electricity] 
    data: [
        [value_of_average_gasoline, value_of_average_electricity]
        []
        [],
        [],
        []
    ]
    */

    //return {array_of_main_data, array_of_current_months, array_of_used_type_of_fuel, data_array}
    return {array_of_current_months, array_of_used_type_of_fuel, data_array}
}


// ================================== CHART 4 - Monthy Fuel Price Chart ===================================
const _main_function_chart_4 = async (usr_id, current_year) => {

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
    let label = [];
    let data = [];
    let datasets = [];
    average_price_per_unit_by_month.forEach(
        (each_month) => {
            label.push(each_month.month);
            data.push(each_month.average_price_per_unit);
        }
    );
    
    datasets.push({data})

    return {label, datasets}
    
};

// ================================== CHART 5 - Monthly Expenditure for Refuelling Chart ===================================

const _main_function_chart_5 = async (usr_id, current_year) => {
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
        const test = await _main_function_chart_3(usr_id, current_year);
        return {start_current_dates, test};
    },

    chart_4: async (usr_id) => {
        const start_current_dates = await _start_current_dates(usr_id);
        const current_year = await _current_year();
        const data = await _main_function_chart_4(usr_id, current_year);
        return {start_current_dates, current_year, data};
    },

    chart_5: async (usr_id) => {
        const start_current_dates = await _start_current_dates(usr_id);
        const current_year = await _current_year();
        const data = await _main_function_chart_5(usr_id, current_year);
        return {start_current_dates, current_year, data};
    }
}