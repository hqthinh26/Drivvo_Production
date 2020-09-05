const pool = require('./pooling');

const isExist = async (usr_id, deviceID) => {
    try {  
        const query1 = await pool.query(`
        SELECT device_unique_id
        FROM deviceid
        WHERE usr_id = $1 AND device_unique_id = $2
        `, [usr_id, deviceID]);
        const row_count = query1.rowCount;
        return row_count === 0 ? false : true;
    } catch (err) {
        throw new Error(err);
    }
}
module.exports = {
    insert: async (usr_id, deviceID) => {
        try {
            if (await isExist(usr_id, deviceID) === false) {
                await pool.query(`
                INSERT INTO deviceid(usr_id, device_unique_id)
                VALUES ($1, $2)
                `, [usr_id, deviceID]);
                return console.log(`insert device id: ${deviceID}`);
            }
            return console.log('DeviceID da ton tai');
        } catch (err) {
            throw new Error(err);
        }
    },
    user_tokens: async (usr_id) => {
        try {
            const query1 = await pool.query(`
            SELECT device_unique_id
            FROM deviceid
            WHERE usr_id = $1
            `, [usr_id]);
            const token_array = query1.rows.map((each_row) => each_row.device_unique_id);
            console.table(token_array);
            return token_array;
        } catch (err) {
            throw new Error(err);
        }
    }
}