const express = require('express');
const {uuid} = require('uuidv4');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const napNLMethod = require('../database/napNLMethod');
const historyMethod = require('../database/historyMethod');
const odometer_schedulerMethod = require('../database/odometer_schedulerMethod');
const fuel_efficiency = require('../report/fuel_efficiency');

const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send('this is nap nhien lieu route');
})

router.get('/print', Auth_IN_OUT.extractToken, async (req, res) => {
    try {
        //Return nll_array
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const napnhienlieu_arr = await napNLMethod.print(usr_id);

        //Return average_array
        const {average_array} = await fuel_efficiency.print_fuel_efficiency(usr_id);
        
        //Combining
        const arr_length = napnhienlieu_arr.length - 1;

        const combined_arr = napnhienlieu_arr.map(
            (each_report_NLL, index) => {
                const desired_index = arr_length - index;
                return ({
                    ...each_report_NLL,
                    average_kml: average_array[desired_index],
                })
            }
        );
        res.status(200).send({
            message: 'Chỉ số average có tên là: average_kml trong từng object NLL',
            napnhienlieu_arr: combined_arr,
            average_array,
        });

        //napnhienlieu_arr = []
        //average_arr = {all_row_without_timestampt: [], average_array: [], lastest/min/max: {id, average}}
        
    } catch (err) {
        console.log(err);
        res.status(500).send({err});
    }
})
router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    
    // IMPORTANT: Below are the list of foreign-key values
    // => the value must alr exist in the database
    // They are: type_of_fuel, gas_station,  reason
    
    try {
        //get u_id of the user based on their login email
        //Napnhienlieu table has a foreign key that links to User's ID
        const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);
    
        //This UUID will be used to insert into 3 tables: NNL Table, All_form_detail Table & All_form Table
        const form_UUID = uuid();

        // location is renamed to 'gas_station'
        const inputFromClient 
        = {odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, gas_station, date, time} 
        = req.body;

        //Insert into NNL Table
        await napNLMethod.insert(form_UUID, usr_id, inputFromClient);

        //Insert into All_form_detail Table
        const type_of_form = 'napnhienlieu';
        console.log('current:' + form_UUID);
        await historyMethod._allform_Insert_napnhieulieu(usr_id, type_of_form, form_UUID, {time,date});

        await odometer_schedulerMethod.push_notification_if_needed(usr_id, odometer);
        return res.sendStatus(200);
    }  
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromUser 
    = {form_id, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location, time, date} 
    = req.body;

    try {
        await napNLMethod._update(form_id, inputFromUser);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.delete('/delete', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const {form_id} = req.body;
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        await napNLMethod.delete(usr_id, form_id);
        res.status(200).send('SUCCESSFUL delete nll ' + form_id);
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

module.exports = router;