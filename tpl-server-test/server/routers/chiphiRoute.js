const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const chiphiMethod = require('../database/chiphiMethod');
const historyMethod = require('../database/historyMethod');
const odometer_schedulerMethod = require('../database/odometer_schedulerMethod');
const {uuid} = require('uuidv4');


const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send("Hello, this is chiphi Route");
})

router.get('/print', Auth_IN_OUT.extractToken, async (req, res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const chiphi_arr = await chiphiMethod.print(usr_id);
        res.status(200).send({chiphi_arr});
    } catch (err) {
        console.log(err);
        res.status(500).send({err});
    }
});

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
   
    //IMPORTANT: Below is the list of FOREIGN-KEY values 
    //=> so that these values must alr exist in the database 
    // They are: type_of_expense, place, reason

    //create chiphi_uuid with uuidv4 construction method.
    const chiphi_UUID = uuid();
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        console.log(`usr_id = ${usr_id}`);
        const inputFromUser 
        = {odometer, type_of_expense, amount, place, reason, note, date, time}
        = req.body;

        //import new row to the table chiphi
        await chiphiMethod.insert(chiphi_UUID, usr_id, inputFromUser);
        //import new row to All Form Table
        const type_of_form = 'chiphi';
        await historyMethod._allform_Insert_chiphi(usr_id, type_of_form, chiphi_UUID, {time, date});
        console.log('import chiphi to history');
        await odometer_schedulerMethod.push_notification_if_needed(usr_id, odometer);

        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {

    const inputFromUser = {form_id ,odometer, type_of_expense, amount, location, note, time, date} = req.body;

    try {
        await chiphiMethod._update(form_id, inputFromUser);
        res.status(200).send({message: 'successful'});
    } catch (err) {
        console.log(err);
    }


});

router.delete('/delete', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const {form_id} = req.body;
    console.log({X: form_id});
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        await chiphiMethod.delete(usr_id, form_id);
        res.status(200).send('SUCCESSFUL chiphi ' + form_id);
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

module.exports = router;