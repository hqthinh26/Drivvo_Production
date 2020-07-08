const pool = require('../database/pooling');

const start_current_dates = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT min(created_at_date) as start_date, max(created_at_date) as current_date
    FROM history
    WHERE usr_id = $1
    `, [usr_id]);
   return query1.rows[0];
};

const pie_chart_data = async (usr_id) => {
    const query1 = await pool.query(`
    SELECT lnl.name as type_of_fuel, sum(nll.total_cost) as total_amount
    FROM napnhienlieu as nll, loainhienlieu as lnl
    WHERE (lnl.usr_id = $1) AND (nll.type_of_fuel = lnl.id)
    GROUP BY lnl.name
    `,[usr_id]);
    const query1_result = query1.rows.map(
        (each_row) => ({
            ...each_row,
            total_amount: parseInt(each_row.total_amount),
        })
    );
    return query1_result;
}


module.exports = {
    pie_chart: async (usr_id) => {
        const start_currentE = await start_current_dates(usr_id);
        const pie_chart_dataE = await pie_chart_data(usr_id);
        return pie_chart_dataE;
    }
}