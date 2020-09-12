const pool = require('../database/pooling');
const { raw } = require('body-parser');

const _now = async () => {
    const query0 = await pool.query(`SELECT date_trunc('day', now())`);
    return query0.rows[0].date_trunc;
}
const retrieve_start_current_days = async (usr_id) => {
    const query0 = await pool.query(`SELECT count(id) from chiphi where u_id = $1`,[usr_id]);
    //Neu chua co 1 dong data nao trong table chiphi thi return ngay hien tai
    if(query0.rows[0].count === '0' ) {
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

const retrieve_data_expense = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT lcp.name as type_of_expense, sum(cp.amount) as total_amount
    FROM chiphi as cp, loaichiphi as lcp
    WHERE (u_id = $1) AND (cp.type_of_expense = lcp.id)
    GROUP BY lcp.name
    `,[usr_id]);
    return query1.rows;
};

const extract_year = async () => {
    const query1 = await pool.query(`SELECT extract(year from now()) as current_year`);
    return query1.rows[0].current_year;
}

const main_return_chart_2 = async (usr_id, current_year) => {
    const query1 = await pool.query(`
    SELECT EXTRACT(MONTH FROM date) as month, sum(amount) as monthly_total
    FROM chiphi
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `, [usr_id, current_year]); // return an array with multiple columes

    const query1_array = query1.rows;
    

    const month_array = query1_array.map(each_row => each_row.month);
    const monthly_total_array = query1_array.map(each_row => parseInt(each_row.monthly_total));

    // const monthly_total_array = query1_array.map(
    //     (each_row) => {
    //         let temp_array = [];
    //         temp_array.push(parseInt(each_row.monthly_total));
    //         return temp_array;
    //     }
    // );
    
    return {month_array,monthly_total_array};
}

module.exports = {
    chart_1: async (usr_id) => {
        const raw_data = await retrieve_data_expense(usr_id);
        const start_end_dates = await retrieve_start_current_days(usr_id);
        const type_of_expense_AND_total_amountI = raw_data.map(
            (each_row) => ({
                type_of_expense: each_row.type_of_expense,
                total_amount: parseInt(each_row.total_amount),
            })
        );
        return {start_end_dates, type_of_expense_AND_total_amountI};
    },

    chart_2: async (usr_id) => {
        const current_year = await extract_year();
        const chart_2_data = await main_return_chart_2(usr_id, current_year);
        return {type: 'chiphi',chart_2_data};
    }
}