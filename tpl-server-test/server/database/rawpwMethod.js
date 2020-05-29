const pool = require('./pooling');

module.exports = {
    insert: async (u_id,raw_pw) => {
        try {
            await pool.query(`insert into rawpassword(u_id, raw_pw)
            values ($1,$2)`, [u_id,raw_pw]);
        } catch (err) {
            console.log({message: 'insert at rawpw failed', err});
        }
    },
}