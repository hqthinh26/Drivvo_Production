const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const nhacnhoMethod = require('../database/nhacnhoMethod');
const {uuid} = require('uuidv4');
const moment = require('moment');
const historyMethod = require('../database/historyMethod');
const { route } = require('./napnhienlieuRoute');
const app_firebase = require('../database/firebase');


const router = express.Router();

router.post('/', (req,res) => {
    res.status(200).send({message:'Welcome to nhac nho router'});
})

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const input_From_User 
        = {type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometer, OT_at_date, RR_at_km_range, RR_period, note}
        = req.body;

        const nhacnho_id = uuid();
        const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);

        console.log('============================');
        console.log({
            type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometer, OT_at_date, RR_at_km_range, RR_period, note
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

router.get('/print_today_list', Auth_IN_OUT.extractToken, async (req, res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const array_of_nhacnho_date_today = await nhacnhoMethod.print_today_list(usr_id);
        console.log({userID: usr_id});
        res.status(200).send({array_of_nhacnho_date_today});
    } catch (err) {
        res.status(500).send(err);
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
        await nhacnhoMethod.deletex(usr_id, form_id);
        res.status(200).send('SUCCESSFUL delete nhac nho ' + form_id);
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

router.get('/firebase', (req, res) => {
    const token_1132 = 'dlJxd827RfaJ3rj-PAsv_Q:APA91bFFA23TKUE72kLyDV34MG3MXvKO2Nr3DN6VEyPmdmXI2exvDRhDh26FbamvB2aCzsBfKzJBpM7hA6dC2YJK7VB2wrh3Xyah2MgW8AXBpKBCXExm8dlapv4SXR3yl-tYldn-5A_7';
    const payload = {
      token: token_1132,
      notification: {
          title: 'nhac nho router',
          body: '12:1811',
      }
  }
    app_firebase.messaging().send(payload).then(res => console.log(res)).catch(err => console.log(err));
    res.status(200).send({message: 'hello firebase router'});
  });

module.exports = router;