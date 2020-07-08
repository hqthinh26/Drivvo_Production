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
    }
}