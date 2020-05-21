const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const chiphiMethod = require('../database/chiphiMethod');
const usersMethod = require('../database/usersMethod');


const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send("Hello, this is chiphi Route");
})

router.get('/printall', chiphiMethod.printall);

router.post('/insert',Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const u_email = Auth_IN_OUT.emailFromToken(token);

    try {
        const u_id = await usersMethod.getUID_byEmail(u_email);
        const inputFromClient = {odometer, type_of_expense, location, reason} = req.body;

        //import new row to the table chiphi
        await chiphiMethod.insert(inputFromClient, u_id);
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(` errorrr: ${err}`);
        return res.sendStatus(403);
    }
});

//router.post('/insert',chiphiMethod.insert);

module.exports = router;