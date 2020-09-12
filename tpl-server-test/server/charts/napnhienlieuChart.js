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
    const query1 = await pool.query(`
    SELECT date, odometer
    FROM napnhienlieu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    ORDER BY date asc
    `,[usr_id, current_year]);
    let label = []; let odometer_arr = [];
    query1.rows.forEach(
        (each_row) => {
            label.push(each_row.date);
            odometer_arr.push(parseFloat(each_row.odometer));
        }
    );
    const data = odometer_arr.map(
        (each_row, each_row_index, odometer_arr) => {
            if(each_row_index === odometer_arr.length -1){
                return 0.0;
            }
            console.log(odometer_arr.length);
            return odometer_arr[each_row_index+1] - odometer_arr[each_row_index];
        }
    );
    return {label, data};
}

// ================================== CHART 3 - Monthly Average Fuel Price =================================

const _main_function_chart_3 = async (usr_id, current_year) => {

    //Return an array of price_per_unit ORDER BY type_of_fuel
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM nll.date) as month, lnl.name, AVG(nll.price_per_unit) as price_per_unit
    FROM napnhienlieu as nll, loainhienlieu as lnl
    WHERE (nll.u_id = $1) AND (EXTRACT(YEAR FROM date) = $2) AND (nll.type_of_fuel = lnl.id)
    GROUP BY EXTRACT(MONTH FROM date), lnl.name
    ORDER BY month asc, lnl.name asc
    `, [usr_id, current_year])


    //array_of_main_data = [{month, name, price_per_unit}, {}, {}, ...]
    const array_of_main_data = query1.rows.map(
        (each_row) => ({
            ...each_row,
            price_per_unit: parseInt(each_row.price_per_unit),
        })
    );


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

    // const data_array = array_of_current_months.map(
    //     (each_month) => {
    //         const tmp_data_array = array_of_main_data.filter(
    //             (month_in_main_data) => month_in_main_data.month === each_month
    //         );
    //         const test = array_of_used_type_of_fuel.map(
    //             (each_type) => {
    //                 let count = 0; let total = 0; let average = 0.000;
    //                 tmp_data_array.forEach(
    //                     (for_each_value) => {
    //                         if(for_each_value.name === each_type) {
    //                             count++;
    //                             total = total + for_each_value.price_per_unit;
    //                         }
    //                         average = parseFloat((total / count).toFixed(3));
                            
    //                     }
    //                 );
    //                 count === 0 ? average = 0.000 : average;
    //                 return average;
    //             }
    //         );
    //         return test; //[x,y]
    //     }
    // )

    const data_arr = array_of_used_type_of_fuel.map(
        (each_type) => {
            //Data is stored in data_current_each_type [{month, name, price_per_unit}, {}, ....]
            const data_current_each_type = array_of_main_data.filter((
                (each_row) => each_type === each_row.name
            ));
            const data = array_of_current_months.map(
                (each_month) => {
                    const find = data_current_each_type.find((each_row) => each_row.month === each_month);
                    let result;
                    find === undefined ? result = 0 : result = find.price_per_unit;
                    return result;
                }
            );
            return data;
        }
    );
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
    return {array_of_current_months, array_of_used_type_of_fuel, data_arr}
}


// ================================== CHART 4 - Monthly Expenditure for Refuelling Chart ===================================

const _main_function_chart_4 = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(total_cost) as monthly_cost
    FROM napnhienlieu
    WHERE u_id = $1 AND (EXTRACT(YEAR FROM date) = $2)
    GROUP BY EXTRACT(MONTH FROM date)
    `, [usr_id, current_year]);
    let label = [];
    let data = [];
    query1.rows.forEach(
        (each_row) => {
            label.push(each_row.month);
            data.push(parseFloat(each_row.monthly_cost));
        }
    );
    // query1.rows.forEach(
    //     (each_row) => {
    //         label.push(each_row.month);
    //         let decoy_array = [];
    //         decoy_array.push(parseFloat(each_row.monthly_cost));
    //         data.push(decoy_array);
    //     }
    // );
    return {label, data4: data};
}


// ================================== CHART 5 - Expenditure BASED ON Reasons ===================================

const _main_function_chart_5 = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT ld.name as reason, sum(nnl.total_cost) as grand_total_cost
    FROM napnhienlieu as nnl, lydo as ld
    WHERE (nnl.reason = ld.id) AND (nnl.u_id = $1) AND (EXTRACT(YEAR FROM nnl.date) = $2)
    GROUP BY ld.name
    `, [usr_id, current_year]);
    console.log('====================')
    console.log({chart_5:query1.rows});
    console.log('====================')
    let label = [];
    let data = [];
    query1.rows.forEach(
        (each_row) => {
            label.push(each_row.reason);
            //data.push(parseInt(each_row.grand_total_cost));
            let each_row_data_arr = [];
            each_row_data_arr.push((parseInt(each_row.grand_total_cost)));
            data.push(each_row_data_arr); // An array inside another bigger arr
        }
    );
    return {label, data}
}

const _now = async () => {
    const query1 = await pool.query(`SELECT date_trunc('day', now())`);
    return query1.rows[0].date_trunc;
}
module.exports = {
    chart_1: async (usr_id) => {
        //==================== condition - handle if no form is in the table ====================
        const query0 = await pool.query(`SELECT count(id) from napnhienlieu where u_id = $1`, [usr_id]);
        let start_current_dates;
        const now = await _now(); 
        
        query0.rows[0].count === '0' 
        ? start_current_dates = {start_date: now,current_date: now}
        : start_current_dates = await _start_current_dates(usr_id);
        //========================================================================================
        const data = await _main_function_chart_1(usr_id);
        return {start_current_dates, data};
    },

    chart_2: async (usr_id) => {
        const title = 'Odometer chances by days';
        //==================== condition - handle if no form is in the table ====================
        const query0 = await pool.query(`SELECT count(id) from napnhienlieu where u_id = $1`, [usr_id]);
        let start_current_dates;
        const now = await _now(); 
                
        query0.rows[0].count === '0' 
        ? start_current_dates = {start_date: now,current_date: now}
        : start_current_dates = await _start_current_dates(usr_id);
        //========================================================================================
        const current_year = await _current_year();
        const data = await _main_fucntion_chart_2(usr_id, current_year);
        return {title, start_current_dates, current_year, data}
    },

    chart_3: async (usr_id) => {
        const title = 'Average Monthly Fuel Price';
        //==================== condition - handle if no form is in the table ====================
        const query0 = await pool.query(`SELECT count(id) from napnhienlieu where u_id = $1`, [usr_id]);
        let start_current_dates;
        const now = await _now(); 
                
        query0.rows[0].count === '0' 
        ? start_current_dates = {start_date: now,current_date: now}
        : start_current_dates = await _start_current_dates(usr_id);
        //========================================================================================
        const current_year = await _current_year(usr_id);
        const test = await _main_function_chart_3(usr_id, current_year);
        return {title, start_current_dates, test};
    },

    chart_4: async (usr_id) => {
        const title = 'Monthly Expenditure on Refuelling'
        //==================== condition - handle if no form is in the table ====================
        const query0 = await pool.query(`SELECT count(id) from napnhienlieu where u_id = $1`, [usr_id]);
        let start_current_dates;
        const now = await _now(); 
                
        query0.rows[0].count === '0' 
        ? start_current_dates = {start_date: now,current_date: now}
        : start_current_dates = await _start_current_dates(usr_id);
        //========================================================================================
        const current_year = await _current_year();
        const main_data = await _main_function_chart_4(usr_id, current_year);
        return {title, start_current_dates, current_year, main_data};
    },

    chart_5: async (usr_id) => {
        const title = 'TOTAL EXPENDITURE BASED on REASONs';
         //==================== condition - handle if no form is in the table ====================
         const query0 = await pool.query(`SELECT count(id) from napnhienlieu where u_id = $1`, [usr_id]);
         let start_current_dates;
         const now = await _now(); 
                 
         query0.rows[0].count === '0' 
         ? start_current_dates = {start_date: now,current_date: now}
         : start_current_dates = await _start_current_dates(usr_id);
         //========================================================================================
        const current_year = await  _current_year();
        const main_data = await _main_function_chart_5(usr_id, current_year);
        return {title, start_current_dates, current_year, main_data}
    }
}