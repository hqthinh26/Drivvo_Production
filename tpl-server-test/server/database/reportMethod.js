const pool = require('./pooling');

module.exports = {
    balance_sheet: async (usr_id) => {
        const result = await pool.query(`SELECT min(created_at_date) as start_day, max(created_at_date) as current_day 
                                         FROM history
                                         WHERE usr_id = $1`,[usr_id]);
        return result.rows[0];
    },
}