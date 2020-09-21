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

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const quangduong_list = await quangduongMethod.print(usr_id);
        //the value_per_km_calculated has alot a decimal numbers behind => need to be removed
        //It has so many because I use query to calculate it and value_per_km is a string not a number
        const quangduong_list_new = quangduong_list.map(
            (each_quangduong) => {
                const {value_per_km_calculated, total_money_spent} = each_quangduong;

                let reduced_zeros_value_per_km = parseFloat(value_per_km_calculated).toFixed(0);
                let reduced_zeros_total_money = total_money_spent.toString();

                

                const value_per_km_length = reduced_zeros_value_per_km.length;
                const total_money_length = reduced_zeros_total_money.length; 

                if (value_per_km_length > 3) {
                    const comma_position = value_per_km_length - 3;
                    reduced_zeros_value_per_km = [reduced_zeros_value_per_km.slice(0,comma_position), reduced_zeros_value_per_km.slice(comma_position)].join(',');
                }

                if (total_money_length > 3) {
                    const comma_position = total_money_length - 3;
                    reduced_zeros_total_money = [reduced_zeros_total_money.slice(0,comma_position), reduced_zeros_total_money.slice(comma_position)].join(',');
                }

                console.table({value_per_km_calculated, reduced_zeros_value_per_km, total_money_spent, reduced_zeros_total_money});

                return ({...each_quangduong, total_money_spent: reduced_zeros_total_money, value_per_km_calculated: reduced_zeros_value_per_km});
            }
        );
        res.status(200).send({quangduong_list_new});
    } catch (err) {
        console.warn(err);
        res.status(500).send({err});
    }
})

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromUser 
    = {origin, start_time, start_date, initial_odometer, destination, end_time, end_date, final_odometer, total, reason} 
    = req.body;

    const form_uuid = uuid();

    try {
        //const type_of_form = 'quangduong';
        const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);
        //Insert a new row to QuangDuong Table
        await quangduongMethod.insert(form_uuid,usr_id, inputFromUser);

        //console.log({start_time,start_date});
        //Insert a new row to History Table
        //await historyMethod._all_form_insert_quangduong(usr_id, type_of_form, form_uuid, {end_time, end_date});

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
    
    const {form_id} = req.body;
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