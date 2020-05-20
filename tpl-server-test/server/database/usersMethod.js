const pool = require('./pooling');

module.exports = {
    printall: async (req,res) => {
        try{
            const results = await pool.query('select * from users');
            return res.status(200).send({data: results.rows});
            
        } catch (err) {
            console.log(err);
            return res.sendStatus(404);
        }
    },
    insert: async (fullname,phone,email,pw) => {
        try {
            await pool.query(`insert into users(u_fullname, u_phone, u_email, u_pw)
            values ($1,$2,$3,$4)`, [fullname,phone,email,pw]);
            console.log('insert succesfully');
        } catch (err) {
            console.log('insert failed');
        }
    },

    doesExist: async (email) => {
        try {
            const results = await pool.query('select u_email from users');
            console.log('ansers table');
            console.table(results.rows);
            const resultsArray = results.rows;
            const existed = resultsArray.find(user => user.u_email === email);
            if(existed) return true;
            else {
                return false;
            }
        } catch (err) {
            console.log('failed to execute doesExist');
        }
    },
    
    checkValidEmailPw: async (email,pw) => {
        try {
            const result = await pool.query(`select u_email, u_pw from users`);
            console.table(result.rows);
            
            const userArray = result.rows;
            const valid = userArray.find(user => user.u_email === email && user.u_pw === pw);
            if (valid !== undefined) return true;
            else return false;
        } catch (err) {
            console.log('failed to execute checkValid Email & Pw');
        }
    }, 
    
    getUID_byEmail: async (email) => {
        try {
            const result = await pool.query(`select u_id from users where u_email = $1`, [email]);
            return u_id = result.rows[0].u_id;
        } catch (err) {
            throw new Error('failed to getU_ID');
        }
    },
}