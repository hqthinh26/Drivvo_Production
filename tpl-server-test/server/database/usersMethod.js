const pool = require('./pooling');
const bcryptjs = require('bcryptjs');

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
    insert: async (fullname,phone,email,hashedPw) => {
        try {
            //Step 1  
            await pool.query(`insert into users(u_fullname, u_phone, u_email, u_pw)
            values ($1,$2,$3,$4)`, [fullname,phone,email,hashedPw]);
        } catch (err) {
            console.log({message: 'insert at users failed', err});
        }
    },

    doesExist: async (email) => {
        try {
            const results = await pool.query('select u_email from users');
            console.log('answers table');
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
            //STEP 1: check if the user with the given email exits within the database
            const one_user_info = await pool.query(`select u_pw from users where u_email = $1`, [email]);
            if (one_user_info.rowCount === 0) {
                console.log('Email doesnt exist');
                return false;
            }

            console.table(one_user_info.rows);

            //STEP 2: Check if the pw is valid
            const hashedPwFromDatabase = one_user_info.rows[0].u_pw;
            const isValidPw = bcryptjs.compare(pw,hashedPwFromDatabase);
            if(!isValidPw)  {
                console.log('email is ok but password is wrong')
                return false;
            }

            return true;

        } catch (err) {
            console.log({message: 'failed at check valid email, pw', err});
            return false;
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