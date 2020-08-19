const pool = require('./pooling');

module.exports = {
    insert: async (quangduong_id, usr_id, inputFromUser) => {
        const {origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason} 
        = inputFromUser;

        const initial_odometerF = parseFloat(initial_odometer);
        const final_odometerF = parseFloat(final_odometer);
        const value_per_kmI = parseInt(value_per_km);
        const totalI = parseInt(total);

        // reason is INT8-typed value => converting FROM STRING to BIGINT
        const reasonBI = BigInt(reason);
        try {

            await pool.query(`insert into quangduong(id, usr_id, origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason)
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
            , [quangduong_id, usr_id, origin, start_time, start_date, initial_odometerF, destination, end_time, end_date, final_odometerF, value_per_kmI, totalI, reasonBI]);

        } catch (err) {
            throw new Error({message: 'failed at quangduongMethod', ERR: err});
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
           throw new Error({message: 'failed at update method',err});
       }
    },
    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM quangduong WHERE usr_id = $1 AND id = $2`, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2`, [usr_id, form_id]);
        } catch (err) {
            throw new Error({message: 'failed at quang duong delete', Err: err});
        }
    }
}