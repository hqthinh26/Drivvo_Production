const pool = require('../database/pooling');
const { raw } = require('body-parser');

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
        const type_of_expense_AND_total_amountI = raw_data.map(
            (each_row) => ({
                type_of_expense: each_row.type_of_expense,
                total_amount: parseInt(each_row.total_amount),
            })
        );
        return type_of_expense_AND_total_amountI;
    }
}