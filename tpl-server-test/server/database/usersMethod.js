const pool = require('./pooling');
const bcryptjs = require('bcryptjs');
const {uuid} = require('uuidv4');

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
            const auto_generated_uuid = uuid();
            await pool.query(`INSERT INTO users(u_id, u_fullname, u_phone, u_email, u_pw, u_gg)
            values ($1,$2,$3,$4,$5,$6)`, [auto_generated_uuid,fullname,phone,email,hashedPw, false]);
        } catch (err) {
            throw new Error({message: 'insert at users failed', err});
        }
    },

    insert_gg: async (fullname, phone, email) => {
        try {
            const auto_generated_uuid = uuid();
            console.log({automated: auto_generated_uuid});
            await pool.query(`
            INSERT INTO users(u_id, u_fullname, u_phone, u_email, u_gg)
            VALUES ($1, $2, $3, $4, $5)`
            ,[auto_generated_uuid, fullname , phone, email, true]);
        } catch (err) {
            throw new Error({Message: 'Failed at insert_gg', err});
        }
    },

    doesExist: async (email) => {
        try {
            const results = await pool.query('select u_email from users');
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
            const isValidPw = bcryptjs.compareSync(pw,hashedPwFromDatabase);
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

    user_name_email: async (usr_id) => {
        const query = await pool.query(`
        SELECT u_fullname as fullname, u_email as email
        FROM users
        WHERE u_id = $1
        `,[usr_id]);
        const {fullname, email} = query.rows[0];
        return {fullname, email}
    },

}