const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const thunhapMethod = require('../database/thunhapMethod');
const usersMethod = require('../database/usersMethod');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('hello, welcome to thunhap router root route');
})

router.get('/printall', thunhapMethod.printall);

router.post('/insert',Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const u_email = Auth_IN_OUT.emailFromToken(token);
    const inputFromClient = {date, time, odometer, type_of_income, amount, note} = req.body;
    try {
       const u_id =  await usersMethod.getUID_byEmail(u_email);
    
        await thunhapMethod.insert(inputFromClient, u_id);
        return res.sendStatus(200);
    } catch (err) {
        console.log(err.detail);
        return res.status(403).send({message: 'something is wrong in the insert route', detail: err.detail});
    }
    
})
module.exports = router;