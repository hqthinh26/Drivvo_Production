const pool = require('../database/pooling');
const { raw } = require('body-parser');

const retrieve_data_thunhap = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT ltn.name as type_of_income, sum(tn.amount) as total_amounnt
    FROM thunhap as tn, loaithunhap as ltn
    WHERE (u_id = $1) AND (tn.type_of_income = ltn.id)
    GROUP BY ltn.name
    `,[usr_id]);
    return query1.rows;
};

module.exports = {
    chart_1: async (usr_id) => {
        const raw_data = await retrieve_data_thunhap(usr_id);
        return raw_data;
    }
}