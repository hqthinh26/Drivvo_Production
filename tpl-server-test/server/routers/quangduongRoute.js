//Functions from packages
const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const {uuid} = require('uuidv4');
const moment = require('moment');

//Functions from folders
const quangduongMethod = require('../database/quangduongMethod');
const historyMethod = require('../database/historyMethod');

const router = express.Router();

router.post('/', (req,res) => {
    res.status(200).send('Hello, this is quang duong route');
})

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromUser 
    = {origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason} 
    = req.body;

    const form_uuid = uuid();

    try {
        const type_of_form = 'quangduong';
        const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);
        //Insert a new row to QuangDuong Table
        await quangduongMethod.insert(form_uuid,usr_id, inputFromUser);

        console.log({start_time,start_date});
        //Insert a new row to History Table
        await historyMethod._all_form_insert_quangduong(usr_id, type_of_form, form_uuid, {end_time, end_date});

        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    

    const inputFromUser 
    = {form_id, orgin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, value_per_km, total, reason}
    = req.body;

    try {
        const u_id = await Auth_IN_OUT._usr_id_from_token(token);
        await quangduongMethod.update(u_id, inputFromUser);
        return res.sendStatus(200);

    } catch (err) {
        console.log(err)
        return res.send(403).send({message: 'Failed at quang duong route Update',err});
    }
})

router.delete('/delete', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    
    const {from_id} = req.body;
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        await quangduongMethod.delete(usr_id, form_id);
        res.status(200).send('Successfully delete ' + form_id);
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

module.exports = router;