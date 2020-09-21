const pool = require('./pooling');

module.exports = {

    print: async (usr_id) => {
        const query1 = await pool.query(`
        SELECT qd.id, qd.origin, qd.start_date, qd.destination, qd.end_date, qd.final_odometer - qd.initial_odometer as km_committed, qd.total as total_money_spent, qd.total / (qd.final_odometer - qd.initial_odometer) as value_per_km_calculated,ld.name as reason
        FROM quangduong qd
        LEFT JOIN lydo ld
            ON qd.reason = ld.id
        WHERE qd.usr_id = $1
        ORDER BY qd.start_date desc
        `, [usr_id]);
        return query1.rows;
    },
    
    insert: async (quangduong_id, usr_id, inputFromUser) => {
        const {origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, total, reason} 
        = inputFromUser;


        console.log('======== INPUT VALUE - QuangDUong============');
        console.table(inputFromUser);
       

        const initial_odometerF = parseFloat(initial_odometer);
        const final_odometerF = parseFloat(final_odometer);
        //const value_per_kmI = parseInt(value_per_km);
        const totalI = parseInt(total);
        

        // reason is INT8-typed value => converting FROM STRING to BIGINT
        const reasonBI = reason === null ? null : BigInt(reason);
        console.log({reason, reasonBI});
        console.log('============================');

        console.log({reasonBI});
        try {

            await pool.query(`insert into quangduong(id, usr_id, origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer,total, reason)
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
            , [quangduong_id, usr_id, origin, start_time, start_date, initial_odometerF, destination, end_time, end_date, final_odometerF, totalI, reasonBI]);

        } catch (err) {
            throw new Error(err);
        }
    },

    update: async (u_id, inputFromUser) => {
       const {form_id, origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason}
       = inputFromUser;
        
       const initial_odometerF = parseFloat(initial_odometer);
       const final_odometerF = parseFloat(final_odometer);
       const value_per_kmI = parseInt(value_per_km);
       const totalI = parseInt(total);

       try {
            const result = await pool.query(`UPDATE quangduong
                                            SET origin = $1, start_time = $2, start_date = $3, initial_odometer = $4, destination = $5
                                            , end_time = $6, end_date = $7, final_odometer = $8, value_per_km = $9, total = $10, reason = $11
                                            WHERE usr_id = $12 AND id = $13
            `, [origin, start_time, start_date, initial_odometerF, destination, end_time, end_date, final_odometerF, value_per_kmI, totalI, reason, u_id, form_id]);
            console.log({result_log: result})

       } catch (err) {
           throw new Error(err);
       }
    },
    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM quangduong WHERE usr_id = $1 AND id = $2`, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2`, [usr_id, form_id]);
        } catch (err) {
            throw new Error(err);
        }
    }
}