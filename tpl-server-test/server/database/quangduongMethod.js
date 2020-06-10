const pool = require('./pooling');

module.exports = {
    insert: async (quangduong_id, usr_id, inputFromUser) => {
        const {origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason} 
        = inputFromUser;

        const initial_odometerF = parseFloat(initial_odometer);
        const final_odometerF = parseFloat(final_odometer);
        const value_per_kmI = parseInt(value_per_km);
        const totalI = parseInt(total);

        try {

            await pool.query(`insert into route(id, usr_id, origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason)
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
            , [quangduong_id, usr_id, origin, start_time, start_date, initial_odometerF, destination, end_time, end_date, final_odometerF, value_per_km, totalI, reason]);

        } catch (err) {
            console.log('failed at Quang Duong Method', err); // If an error shows up, i will not be returned on this catch anyway
        }
    }
}