const pool = require('../database/pooling');
const e = require('express');

const _now = async () => {
    const query1 = await pool.query(`SELECT date_trunc('day', now())`);
    return query1.rows[0].date_trunc;
}
const retrieve_start_current_days = async (usr_id) => {
    const query0 = await pool.query(`SELECT count(id) from dichvu where u_id = $1`, [usr_id]);
    if(query0.rows[0].count == '0') {
        const now = await _now();
        return {
            start_date: now,
            current_date: now,
        }
    } else {
        const query1 = await pool.query(`
        SELECT min(created_at_date) as start_date, max(created_at_date) as current_date
        FROM history
        WHERE usr_id = $1
        `,[usr_id]);
        const result_query1 = query1.rows[0];
        return result_query1;
    }
};

const retrieve_data_service = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT ldv.name as type_of_service , sum(dv.amount) total_amount
    FROM dichvu as dv, loaidichvu as ldv
    WHERE (u_id = $1) AND (dv.type_of_service = ldv.id)
    GROUP BY ldv.name
    `,[usr_id]);
    
    const result = query1.rows;
    return result;
}

const current_year = async () => {
    const query1 = await pool.query(`SELECT EXTRACT(YEAR FROM now()) as current_year`);
    return query1.rows[0].current_year;
}

const chart_2_main_function = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(amount) as monthly_total
    FROM dichvu
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `,[usr_id, current_year]);
    const month_array = query1.rows.map(each_row => each_row.month);
    const chart_2 = query1.rows.map(each_row => parseInt(each_row.monthly_total));
    
    // const chart_2 = query1.rows.map(
    //     (each_row) => {
    //         let tmp_array = [];
    //         tmp_array.push(parseInt(each_row.monthly_total));
    //         return tmp_array;
    //     }
    // );
    return {month_array,chart_2};
}

module.exports = {
    chart_1: async (usr_id) => {
        const start_current_dates = await retrieve_start_current_days(usr_id)
        const type_of_serviceANDtotal_amount = await retrieve_data_service(usr_id);
        const type_of_serviceANDtotal_amountI = type_of_serviceANDtotal_amount.map(
            (each_row) => ({
                ...each_row,
                total_amount: parseInt(each_row.total_amount),
            })
        );
        return {start_current_dates, type_of_serviceANDtotal_amountI};
    },

    chart_2: async (usr_id) => {
        const year = await current_year();
        const chart_2 = await chart_2_main_function(usr_id, year);
        return {type: 'dichvu', chart_2};
    }
}