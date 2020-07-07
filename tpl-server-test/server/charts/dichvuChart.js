const pool = require('../database/pooling');

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
        const type_of_serviceANDtotal_amount = await retrieve_data_service(usr_id);
        const type_of_serviceANDtotal_amountI = type_of_serviceANDtotal_amount.map(
            (each_row) => ({
                ...each_row,
                total_amount: parseInt(each_row.total_amount),
            })
        );
        return type_of_serviceANDtotal_amountI;
    }
}