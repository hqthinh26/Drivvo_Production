const pool = require('../database/pooling');
const { raw } = require('body-parser');

const retrieve_start_current_days = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT min(created_at_date)as start_date, max(created_at_date) as current_date
    FROM history
    WHERE usr_id = $1
    `,[usr_id]);
    const result_query1 = query1.rows[0];
    return result_query1;
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
    SELECT EXTRACT(MONTH FROM date) as month, sum(amount) as total_monthly
    FROM chiphi
    WHERE u_id = $1 AND EXTRACT(YEAR FROM date) = $2
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month asc
    `, [usr_id, current_year]); // return an array with multiple columes
    const result = query1.rows.map(
        (each_row) => ({
            month: `${each_row.month}/${current_year}`,
            monthly_total: parseInt(each_row.total_monthly),
        })
    );
    return result;
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