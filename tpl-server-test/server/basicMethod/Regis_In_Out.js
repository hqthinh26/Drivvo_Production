const jwt = require('jsonwebtoken');
const userMethod = require('../database/usersMethod');
const tokenMethod = require('../database/tokenMethod');
const rawpwMethod = require('../database/rawpwMethod');


const bcryptJS = require('bcryptjs');

module.exports = {
    register:  async (req,res) => {
         //There are 2 steps needed to be done 
        // +1: Insert new user to the USER TABLE with HASHED password
        // +1: Insert new user's raw_password to RAWPASSWORD TABLE.
        
        const {fullname, phone, email, pw} = req.body;
        console.log({message: 'User info', fullname,phone,email,pw});

        try {
            if (await userMethod.doesExist(email) === true)
                return res.sendStatus(404);
            const salt = await bcryptJS.genSalt(10);
            const hashedPw = await bcryptJS.hash(pw,salt);

            //Step 1
            await userMethod.insert(fullname,phone,email,hashedPw);
            const u_id = await userMethod.getUID_byEmail(email); //return new u_id to insert to table rawpw
            console.log(u_id);
            //Step 2
            await rawpwMethod.insert(u_id,pw);

            return res.sendStatus(200);
        }
        catch (err) {
            console.log({message: err});
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
            console.log({errMess: err});
            res.status(403).send({err: err});
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