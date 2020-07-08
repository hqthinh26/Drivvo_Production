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

const retrieve_data_thunhap = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT ltn.name as type_of_income, sum(tn.amount) as total_amount
    FROM thunhap as tn, loaithunhap as ltn
    WHERE (u_id = $1) AND (tn.type_of_income = ltn.id)
    GROUP BY ltn.name
    `,[usr_id]);
    return query1.rows;
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
    }
}