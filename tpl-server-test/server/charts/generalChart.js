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

    /*const final_result = month_has_data.map(
        (each_month) => {
            let nll; let chiphi; let dichvu;
            const find_nll = nll_array.find((each_row) => each_row.month === each_month);
            const find_chiphi = chiphi_array.find((each_row) => each_row.month === each_month);
            const find_dichvu = dichvu_array.find((each_row) => each_row.month === each_month);
            find_nll === undefined ? nll = 0 : nll = find_nll.monthly_total;
            find_chiphi === undefined? chiphi = 0 : chiphi = find_chiphi.monthly_total;
            find_dichvu === undefined? dichvu = 0 : dichvu = find_dichvu.monthly_total;
            return {
                napnhienlieu: nll,
                chiphi,
                dichvu,
            }
        }
    );*/

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

// ===================================== CHART 3 ===============================================

const start_current_date = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT min(created_at_date) as start_date, max(created_at_date) as current_date
    FROM history
    WHERE usr_id = $1
    `,[usr_id]);
    if(query1.rowCount === 0) return 0;
    return query1.rows[0];
}

const _list_of_nll_cp_dv_inHistory = async (usr_id, current_year) => {
    try {
        //Danh sach cac form dc sap xep theo thu tu thoi gian (date -> time)
        const query1 = await pool.query(`
        SELECT type_of_form, id_private_form, EXTRACT(MONTH FROM created_at_date) as month
        FROM history
        WHERE       (usr_id = $1)
                AND (EXTRACT(YEAR FROM created_at_date) = $2)
                AND (type_of_form IN ($3,$4,$5))
        ORDER BY created_at_date asc, created_at_time asc
        `,[usr_id, current_year, 'napnhienlieu', 'chiphi', 'dichvu']);

        const array_odometer_raw = await Promise.all(query1.rows.map(mapping_each_type_form));
        const array_odometer = array_odometer_raw.map((each) => each.rows[0]);

        return array_odometer;
    } catch  (err) {
        throw new Error({message: 'failed at list_of_nll_cp_dv_inHistory',err});
    }
    
}

const mapping_each_type_form = (one_row) => {
    if(one_row.type_of_form === 'napnhienlieu') return pool.query(`SELECT EXTRACT(MONTH FROM date) as month, odometer FROM napnhienlieu WHERE id = $1`, [one_row.id_private_form]);
    if(one_row.type_of_form === 'chiphi') return pool.query(`SELECT EXTRACT(MONTH FROM date) as month, odometer FROM chiphi WHERE id = $1`, [one_row.id_private_form]);
    if(one_row.type_of_form === 'dichvu') return pool.query(`SELECT EXTRACT(MONTH FROM date) as month, odometer FROM dichvu WHERE id = $1`,[one_row.id_private_form]);
}
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
            // lay timestamp
            const start_and_current_dates = await start_current_date(usr_id);
            const current_year = await _current_year();
            const list_of_nll_cp_dv_inHistory = await _list_of_nll_cp_dv_inHistory(usr_id,current_year);
            // lay danh sach id cua (NLL, chiphi, dich vu)
            // lay Month cua tat ca cac form, Odometer cua tat ca cac form
            //in tat ca ra 1 object duy nhat
            return {start_and_current_dates, current_year, list_of_nll_cp_dv_inHistory};
        } catch (err) {
            throw new Error({message: 'failed at chart_3 GENERAL',err});
        }
    }
}