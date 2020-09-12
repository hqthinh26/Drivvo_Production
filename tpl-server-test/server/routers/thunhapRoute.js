const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const thunhapMethod = require('../database/thunhapMethod');
const historyMethod = require('../database/historyMethod');
const odometer_schedulerMethod = require('../database/odometer_schedulerMethod');
const {uuid} = require('uuidv4');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('hello, welcome to thunhap root route');
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const thunhap_arr  = await thunhapMethod.printall(usr_id);
        res.status(200).send({thunhap_arr});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/insert',Auth_IN_OUT.extractToken, async (req,res) => {

    //IMPORTANT: below is the list of foreign-key values 
    //So that these value must alr exist in the database before being used.
    // They are: type_of_income

    const token = req.token;
    const inputFromUser = {odometer, type_of_income, amount, note, date, time} = req.body;
    const thunhap_UUID = uuid();
    try {
        
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const type_of_form = 'thunhap';

        // Step 1: Add a new row to Thu Nhap Table
        await thunhapMethod.insert(thunhap_UUID,usr_id,inputFromUser);

        // Step 2: Add a new row to All Form Table 
        await historyMethod._all_form_insert_thunhap(usr_id, type_of_form, thunhap_UUID, inputFromUser);

        await odometer_schedulerMethod.push_notification_if_needed(usr_id, odometer);
        
        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromUser 
    = {form_id, odometer, type_of_income, amount, note, time, date}
    = req.body;
    console.log(inputFromUser);
    try {
        await thunhapMethod._update(form_id, inputFromUser);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
});

router.delete('/delete', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const {form_id} = req.body;
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        await thunhapMethod.delete(usr_id, form_id);
        res.status(200).send('Successfully delete ' + form_id);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;