// @ts-ignore
const jwt = require('jsonwebtoken');
// @ts-ignore
const userMethod = require('../database/usersMethod');
// @ts-ignore
const tokenMethod = require('../database/tokenMethod');

// @ts-ignore
const bcryptJS = require('bcryptjs');

module.exports = {
    // @ts-ignore
    register:  async (req,res) => {
        const {fullname, phone, email, pw} = req.body;
        //the method return TRUE => Can create user | False => Can't create user
        console.log('dau tien: ', fullname, phone, email, pw);
        try {
            if (await userMethod.doesExist(email) === true)
            return res.sendStatus(404);
        
            //using brypyJS
            //const salt = await bcryptJS.genSalt(10);
            //const hashedPw = await bcryptJS.hash(pw, salt);
            //await userMethod.insert(fullname,phone,email,hashedPw);
            await userMethod.insert(fullname,phone,email,pw);
            return res.sendStatus(200);
        }
        catch (err) {
            console.log({message: err});
        }
    },

    // @ts-ignore
    login: async (req,res) => {

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
    // @ts-ignore
    logout: async (req,res) => {
        const token = req.token;
        console.log('this is logout method token: ' + token);
        try {
            const checkSuccess = await tokenMethod.delete(token);
            if (checkSuccess) return res.sendStatus(200);
            return res.status(403).send('failed to delete token');
        }
        catch (err) {
            console.log(err + 'logout');
            return res.sendStatus(403);
        }
        
    }
}