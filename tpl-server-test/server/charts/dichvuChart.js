const pool = require('../database/pooling');

const retrieve_start_current_days = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT min(created_at_date)as start_date, max(created_at_date) as current_date
    FROM history
    WHERE usr_id = $1
    `,[usr_id]);
    const result_query1 = query1.rows[0];
    return result_query1;
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
    }
}