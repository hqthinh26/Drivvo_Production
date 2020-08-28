const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const nhacnhoMethod = require('../database/nhacnhoMethod');
const {uuid} = require('uuidv4');
const moment = require('moment');
const historyMethod = require('../database/historyMethod');
const { route } = require('./napnhienlieuRoute');


const router = express.Router();

router.post('/', (req,res) => {
    res.status(200).send({message:'Welcome to nhac nho router'});
})

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const input_From_User 
        = {type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometer, OT_at_date, RR_at_km_range, RR_period}
        = req.body;

        const nhacnho_id = uuid();
        const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);

        console.log('============================');
        console.log({
            type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometer, OT_at_date, RR_at_km_range, RR_period
        })
        console.log('============================');

        // Add to nhac nho table
        await nhacnhoMethod.insert(nhacnho_id, usr_id, input_From_User);

        res.status(200).send({message: 'OK nhac nho'});

    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const table = await nhacnhoMethod.print(usr_id);
        res.status(200).send({table});
    } catch (err) {
        res.sendStatus(500);
        console.log({ERR: err});
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const inputFromUser
    = {form_id, name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, RR_km, RR_period, note}
    = req.body;

    try {
        const u_id = await Auth_IN_OUT._usr_id_from_token(token);
        await nhacnhoMethod.update(u_id, inputFromUser);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(403).send(err);
    }
});

router.delete('/delete', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const {form_id} = req.body;
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        await nhacnhoMethod.delete(usr_id, form_id);
        res.status(200).send('SUCCESSFUL delete nhac nho ' + form_id);
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});



module.exports = router;