const jwt = require('jsonwebtoken');
const userMethod = require('../database/usersMethod');
const tokenMethod = require('../database/tokenMethod');

module.exports = {
    register:  async (req,res) => {
        const {fullname, phone, email, pw} = req.body;
        //the method return TRUE => Can create user | False => Can't create user
        console.log('dau tien: ', fullname, phone, email, pw);
        if (await userMethod.doesExist(email) === true)
            return res.sendStatus(404);
        await userMethod.insert(fullname,phone,email,pw);
        return res.sendStatus(200);
    },

    login: async (req,res) => {
        const {email, pw} = req.body;
       
        //Check if the user has alr been existing in the system
        if (await userMethod.checkValidEmailPw(email,pw))
        {
            const payload = {email,pw};
            const token = jwt.sign(payload, 'drivvo');
            console.log('login token: '+ token);
            try {
                await tokenMethod.insert(token);
            } catch (err) {
                console.log('Failed await insert token');
            }
            return res.status(200).send({token: token});
        }
        else return res.sendStatus(403);
        
    },
    logout: async (req,res) => {
        const token = req.token;
        console.log('this is logout method token: ' + token);
        try {
            const checkSuccess = await tokenMethod.delete(token);
            if (checkSuccess) return res.sendStatus(200);
            else res.sendStatus(403);
        }
        catch (err) {
            console.log(err + 'logout');
        }
        
    }
}