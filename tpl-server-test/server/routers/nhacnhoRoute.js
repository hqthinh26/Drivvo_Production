const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const nhacnhoMethod = require('../database/nhacnhoMethod');
const {uuid} = require('uuidv4');
const moment = require('moment');
const historyMethod = require('../database/historyMethod');


const router = express.Router();

router.post('/', (req,res) => {
    res.status(200).send('Welcome to nhac nho router');
})

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const inputFromUser 
        = {name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, RR_km, RR_period, note}
        = req.body;

        const nhacnho_id = uuid();
        const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);

        // Add to nhac nho table
        await nhacnhoMethod.insert(nhacnho_id, usr_id, inputFromUser);

        //Add to history table
        const time = moment().format('LTS');
        const date = moment().format('L');
        const time_date = {time, date};
        const type_of_form = 'nhacnho';

        await historyMethod._all_form_insert_nhacnho(usr_id, type_of_form, nhacnho_id, time_date);

        res.status(200).send('Successful')

    } catch (err) {
        console.log({message: 'failed at nhac nho route insert', err});
        res.status(500).send('fail');
    }
})

module.exports = router;