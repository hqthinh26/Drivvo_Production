const pool = require('../database/pooling');
const { idleCount } = require('../database/pooling');

// ===================================== CHART 2 ===============================================
const total_each_type = async (type_array, usr_id) => {
    return Promise.all(
        type_array.map((each_row) => {
            if(each_row === 'napnhienlieu') {
                return pool.query(`
                SELECT sum(total_cost) as total FROM napnhienlieu WHERE u_id = $1`,[usr_id]);
            }
            if(each_row === 'chiphi') {
                return pool.query(`
                SELECT sum(amount) as total FROM chiphi WHERE u_id = $1`,[usr_id]);
            }
            if(each_row === 'dichvu') {
                return pool.query(`
                SELECT sum(amount) as total FROM dichvu WHERE u_id = $1`,[usr_id]);
            }
        })
    );
};

// ===================================== CHART 2 ===============================================

const _current_year = async () => {
    const query1 = await pool.query(`SELECT EXTRACT(YEAR FROM now()) as current_year`);
    return query1.rows[0].current_year;
};


const array_parse_INT = (array) => {
    const result = array.map(
        (each_row) => ({
            ...each_row,
            monthly_total: parseInt(each_row.monthly_total),
        })
    );
    return result;
}

const total_amount_napnhienlieu_each_month = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(total_cost) as monthly_total
    FROM napnhienlieu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `, [usr_id, current_year]);
    const nll_monthly = array_parse_INT(query1.rows);
    return nll_monthly;
};

const total_amount_chiphi_each_month = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(amount) as monthly_total
    FROM chiphi
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `, [usr_id, current_year]);
    const chiphi_monthly = array_parse_INT(query1.rows); // this is an array
    return chiphi_monthly;
}

const total_amount_dichvu_each_month = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(amount) as monthly_total
    FROM dichvu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `, [usr_id, current_year]);
    const dichvu_monthly = array_parse_INT(query1.rows);
    return dichvu_monthly;
}

const chart_2_main_function = async (array_containing_3_smaller_arrays, usr_id, current_year) => {
    const nll_array = array_containing_3_smaller_arrays[0]; // [{month, monthly_total}, {month, monthly_total}, {month, monthly_total}, ...]
    const chiphi_array = array_containing_3_smaller_arrays[1];
    const dichvu_array = array_containing_3_smaller_arrays[2];

    const query1 = await pool.query(`
    SELECT 
        DISTINCT EXTRACT(MONTH FROM created_at_date) as month_has_data
    FROM history
    WHERE       (usr_id = $1) 
            AND (EXTRACT(YEAR FROM created_at_date) = $2)
            AND (type_of_form IN ($3,$4,$5))
    ORDER BY    month_has_data
    `, [usr_id, current_year, 'napnhieulieu','chiphi','dichvu']);

    const month_has_data= query1.rows.map(
        (each_row) => each_row.month_has_data
    );

    const chart_2 = month_has_data.map(
        (each_month) => {
            let nll; let chiphi; let dichvu; let tmp_array = [];
            const find_nll = nll_array.find((each_row) => each_row.month === each_month);
            const find_chiphi = chiphi_array.find((each_row) => each_row.month === each_month);
            const find_dichvu = dichvu_array.find((each_row) => each_row.month === each_month);
            find_nll === undefined ? nll = 0 : nll = find_nll.monthly_total;
            find_chiphi === undefined ? chiphi = 0 : chiphi = find_chiphi.monthly_total;
            find_dichvu === undefined ? dichvu = 0 : dichvu = find_dichvu.monthly_total;
            tmp_array.push(nll, chiphi, dichvu);
            return tmp_array; // Order: Nap nhien lieu, chi phi, dich vu
        }
    );

    return {month_has_data,chart_2};
}

// ===================================== CHART 3 Version 2 ===============================================

// each_row belongs to more_infor_data array || each_row = {month, infor_min_date, infor_max_date}
const return_odometers = async (each_row) => {
    const {month, infor_min_date, infor_max_date} = each_row;
    const min_date_odometer_query = await query_for_each_date(infor_min_date);
    const max_date_odometer_query = await query_for_each_date(infor_max_date);

    const min_date_odometer = parseFloat(min_date_odometer_query.rows[0].odometer);
    const max_date_odometer = parseFloat(max_date_odometer_query.rows[0].odometer);
    const substract = max_date_odometer - min_date_odometer;
    return {
        month, 
        min_date_odometer,
        max_date_odometer,
        substract,
    };
}

//date = {type_of_form, id_private_form}
const query_for_each_date = async (date) => {
    const {type_of_form, id_private_form } = date;
    if(type_of_form === 'napnhienlieu') return await pool.query(`SELECT odometer FROM napnhienlieu WHERE id = $1`, [id_private_form]);
    if(type_of_form === 'chiphi') return await pool.query(`SELECT odometer FROM chiphi WHERE id = $1`, [id_private_form]);
    if(type_of_form === 'dichvu') return await pool.query(`SELECT odometer FROM dichvu WHERE id = $1`, [id_private_form]);
};

// each_row = {month, min_date, max_date}
const find_infor_min_and_max_dates = async (each_row, usr_id) => {
    const {month, min_date, max_date} = each_row;
    const min_date_query =  await pool.query(`
    SELECT type_of_form, id_private_form
    FROM history
    WHERE usr_id = $1 AND created_at_date = $2
    ORDER BY created_at_time asc
    LIMIT 1
    `, [usr_id, min_date]);
    const infor_min_date = min_date_query.rows[0];

    
    const max_date_query = await pool.query(`
    SELECT type_of_form, id_private_form
    FROM history
    WHERE usr_id = $1 AND created_at_date = $2
    ORDER BY created_at_time desc
    LIMIT 1
    `, [usr_id, max_date]);
    const infor_max_date = max_date_query.rows[0];

    return {month, infor_min_date, infor_max_date};  //infor_min_date = {type_of_form, id_private_form}
}

// =============== THE MAIN STAR ===================
const chart_3_main_function = async (usr_id, current_year) => {

    // take the first date and last day that users input a form in EACH MONTH
    const min_max_dates_each_month = await pool.query(`
    SELECT EXTRACT(MONTH FROM created_at_date) as month, min(created_at_date) as min_date, max(created_at_date) as max_date
    FROM history
    WHERE (usr_id = $1) AND (EXTRACT(YEAR FROM created_at_date) = $2) AND (type_of_form IN ($3, $4, $5))
    GROUP BY EXTRACT(MONTH FROM created_at_date)
    `,[usr_id, current_year, 'napnhienlieu', 'chiphi', 'dichvu']);
    
    // Remove months that only have a single form within 
    const months_that_have_atleast_2_forms = min_max_dates_each_month.rows.filter(
        (each_row) => !(JSON.stringify(each_row.min_date) === JSON.stringify(each_row.max_date))
    );
    
    //After knowing the dates - In this step. I find more infor about it (id_private_form and type_of_form)
    //each_row = {month, min_date, max_date} 
    const more_infor_data = await Promise.all(
        months_that_have_atleast_2_forms.map(
            (each_row) => (find_infor_min_and_max_dates(each_row, usr_id))
        )
    );
    
    // After knowing the detail => I will find the odometers 
    //dates_odometers = [{ month, min_date_odometer,max_date_odometer,substract}, { month, min_date_odometer,max_date_odometer,substract}, ... ];
    const dates_odometers = await Promise.all(
        more_infor_data.map(
            (each_row_of_more_infor_data) => return_odometers(each_row_of_more_infor_data)
        )
    );
    
    // After having the odometer => Steps below . I extract information and send it to the front-end
    const label = dates_odometers.map(
        (each_row) => each_row.month
    );
    
    const data = dates_odometers.map(
        (each_row) => each_row.substract
    );

    //this is the final result
    return {label, data};
};

module.exports = {
    chart_1: async (usr_id) => {
        const type_array = ['napnhienlieu', 'chiphi', 'dichvu'];

        // The function below is the most important 
        const big_one = await total_each_type(type_array, usr_id);

       const final_result = big_one.map(
           (each_type, index) => ({
              type_of_cost: type_array[index], 
              total: parseInt(each_type.rows[0].total),
           })
       );
       return final_result;
    },
    
    chart_2: async (usr_id) => {
        try {
            const current_year = await _current_year();
            
            const all = await Promise.all([
                total_amount_napnhienlieu_each_month(usr_id, current_year),
                total_amount_chiphi_each_month(usr_id, current_year),
                total_amount_dichvu_each_month(usr_id, current_year),
            ]);
            
            const chart_2 = await chart_2_main_function(all, usr_id, current_year);
            return {current_year, chart_2};
        }
        catch (err) {
            throw new Error({message: 'failed at chart_2 general', err});
        }
    },

    chart_3: async (usr_id) => {
        try {
            const current_year = await _current_year();
            const data = await chart_3_main_function(usr_id, current_year);
            return {current_year, data};
        } catch (err) {
            throw new Error({message: 'failed at chart_3 GENERAL',err});
        }
    }
}