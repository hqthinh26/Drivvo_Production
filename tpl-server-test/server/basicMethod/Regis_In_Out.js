const jwt = require('jsonwebtoken');
const userMethod = require('../database/usersMethod');
const tokenMethod = require('../database/tokenMethod');


const bcryptJS = require('bcryptjs');
const { doesExist } = require('../database/usersMethod');
const pool = require('../database/pooling');

module.exports = {
    register:  async (req,res) => {
         //There are 2 steps needed to be done 
        // +1: Insert new user to the USER TABLE with HASHED password
        // +1: Insert new user's raw_password to RAWPASSWORD TABLE.
        
        const {fullname, phone, email, pw} = req.body;
        try {
            if (await userMethod.doesExist(email) === true){
                return res.status(404).send({message: 'User has alr existed via Email Validation'});
            }
                
            const salt = await bcryptJS.genSalt(10);
            const hashedPw = await bcryptJS.hash(pw,salt);
            //Step 1
            await userMethod.insert(fullname,phone,email,hashedPw);

            return res.sendStatus(200);
        }
        catch (err) {
            console.log({message: err});
        }
    },

    signIN_gg: async (req,res) => {
        try {

            // Step 1: Receive fullname, phone and email from client 
            const {fullname, phone, email} = req.body;
            console.log({fullname, phone, email});
            //Step 2: Check if the email has been existing
            const checkEmail_existence = await userMethod.doesExist(email);
            console.log({exist: checkEmail_existence});
            //Step 3: If doesn't exist -> Register
            if(!checkEmail_existence) {
                await userMethod.insert_gg(fullname, phone, email);
            }
            //Step 4: Login user
            const payload = {email};
            const token = jwt.sign(payload,process.env.SECRET_KEY2);
            const query1 = await pool.query('SELECT u_id FROM users WHERE u_email = $1',[email]);
            const u_id = query1.rows[0].u_id;
            console.log({U_ID: u_id});
            await tokenMethod.insert(u_id, token);
            //Step 5: Return like normal {send token to user}
            console.log('SIGNIN GOOGLE');
            res.status(200).send({message: 'ok', token: token});
        } catch (err) {
            console.log(err);
        }
    },

    login: async (req,res) => {

        //Making sure that the email exists and the password is valid
        const {email,pw} = req.body;
        try {
            if(! await userMethod.checkValidEmailPw(email,pw)) {
                console.log('wrong email/pw') 
                return res.status(403).send('Invalid user/password');
            }
            const payload = {email,pw};
            const token = jwt.sign(payload,process.env.SECRET_KEY2);
            const u_id = await userMethod.getUID_byEmail(email);
            await tokenMethod.insert(u_id,token);
            res.status(200).send({message: 'ok', token: token});
        } catch (err) {
            console.log({message: 'failed at login method', ERR:err});
            res.status(403).send(err);
        }

    },
    
    logout: async (req,res) => {
        const token = req.token;
        console.log('this is logout method token: ' + token);
        try {
            const checkSuccess = await tokenMethod.delete(token);
            if (checkSuccess) return res.sendStatus(200);
            return res.status(403).send('failed to delete token');
        }
        catch (err) {
            console.log({message: err});
            return res.sendStatus(403);
        }
        
    }
}