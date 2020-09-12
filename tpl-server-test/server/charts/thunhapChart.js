const pool = require('../database/pooling');
const { raw } = require('body-parser');

const _now = async () => {
    const query1 = await pool.query(`SELECT date_trunc('day', now())`);
    return query1.rows[0].date_trunc;
}
const retrieve_start_current_days = async (usr_id) => {
    const query0 = await pool.query(`SELECT count(id) from thunhap where u_id = $1`,[usr_id]);
    if (query0.rows[0].count === '0') {
        const now = await _now();
        return {
            start_date: now,
            current_date: now,
        }
    } else {
        const query1 = await pool.query(`
        SELECT min(created_at_date)as start_date, max(created_at_date) as current_date
        FROM history
        WHERE usr_id = $1
        `,[usr_id]);
        const result_query1 = query1.rows[0];
        return result_query1;
    }
};

const retrieve_data_thunhap = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT ltn.name as type_of_income, sum(tn.amount) as total_amount
    FROM thunhap as tn, loaithunhap as ltn
    WHERE (u_id = $1) AND (tn.type_of_income = ltn.id)
    GROUP BY ltn.name
    `,[usr_id]);
    return query1.rows;
};

const current_year = async () => {
    const query1 = await pool.query(`SELECT EXTRACT(YEAR FROM now()) as current_year`);
    return query1.rows[0].current_year;
};

const chart_2_main_function = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(amount) as monthly_total
    FROM thunhap
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `,[usr_id, current_year]);
    // const chart_2 = query1.rows.map(
    //     (each_row) => {
    //         let tmp_array = [];
    //         tmp_array.push(parseInt(each_row.monthly_total));
    //         return tmp_array;
    //     }
    // );
    const month_array = query1.rows.map(each_row => (each_row.month));
    const chart_2 = query1.rows.map( each_row => parseInt(each_row.monthly_total));
    return {month_array, chart_2};
};

module.exports = {
    chart_1: async (usr_id) => {
        const start_current_dates = await retrieve_start_current_days(usr_id);
        const type_of_income_AND_total_amount = await retrieve_data_thunhap(usr_id);
        const type_of_income_AND_total_amountI = type_of_income_AND_total_amount.map(
            (each_row) => ({
                ...each_row,
                total_amount: parseInt(each_row.total_amount),
            })
        );
        return {start_current_dates, type_of_income_AND_total_amountI};
    },
    
    chart_2: async (usr_id) => {
        const year = await current_year();
        const chart_2 = await chart_2_main_function(usr_id, year);
        return {type: 'thunhap',chart_2};
    }
}