const express = require('express');
const {uuid} = require('uuidv4');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const napNLMethod = require('../database/napNLMethod');
const usersMethod = require('../database/usersMethod');
const historyMethod = require('../database/historyMethod');

const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send('this is nap nhien lieu route');
})

router.get('/printall',napNLMethod.printall);

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    
    try {
        //get u_id of the user based on their login email
        //Napnhienlieu table has a foreign key that links to User's ID
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    
        //This UUID will be used to insert into 3 tables: NNL Table, All_form_detail Table & All_form Table
        const form_UUID = uuid();

        const inputFromClient = {odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location, date, time} = req.body;
    
        //Insert into NNL Table
        await napNLMethod.insert(form_UUID, usr_id, inputFromClient);

        //Insert into All_form_detail Table
        const type_of_form = 'napnhienlieu';
        console.log('current:' + form_UUID);
        await historyMethod._allform_Insert_napnhieulieu(usr_id, type_of_form, form_UUID, {time,date});

    }  
    catch (err) {throw new Error('Failed at post add NLL');}
    
    return  res.sendStatus(200);
   
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const {form_id, new_location} = req.body;

    console.log({form_id,new_location});
    try {
        await napNLMethod._update(form_id,new_location);
        res.status(200).send({message: 'successful'});
    } catch (err) {
        res.status(403).send({message: 'failed at update'});
    }
})

module.exports = router;