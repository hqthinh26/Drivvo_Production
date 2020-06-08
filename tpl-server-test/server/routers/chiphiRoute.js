const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const chiphiMethod = require('../database/chiphiMethod');
const usersMethod = require('../database/usersMethod');
const historyMethod = require('../database/historyMethod');
const {uuid} = require('uuidv4');


const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send("Hello, this is chiphi Route");
})

router.get('/printall', chiphiMethod.printall);

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;

    //create chiphi_uuid with uuidv4 construction method.
    const chiphi_UUID = uuid();
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        console.log(`usr_id = ${usr_id}`);
        const inputFromUser = {odometer, type_of_expense, amount, location, note, date, time} = req.body;

        //import new row to the table chiphi
        await chiphiMethod.insert(chiphi_UUID, usr_id, inputFromUser);
        //import new row to All Form Table
        const type_of_form = 'chiphi';
        await historyMethod._allform_Insert_chiphi(usr_id, type_of_form, chiphi_UUID, {time, date});

        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err.detail);
        return res.status(403).send({message: 'something is wrong in the insert route', detail: err.detail});
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {

    const inputFromUser = {form_id ,odometer, type_of_expense, amount, location, note, time, date} = req.body;

    try {
        await chiphiMethod._update(form_id, inputFromUser);
        res.status(200).send({message: 'successful'});
    } catch (err) {
        console.log({message: 'failed at update chiphi', err});
    }


});


module.exports = router;