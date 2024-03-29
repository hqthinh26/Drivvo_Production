const router = require('express').Router();
const {uuid} = require('uuidv4');
const dichvuMethod = require('../database/dichvuMethod');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const historyMethod = require('../database/historyMethod');
const odometer_schedulerMethod = require('../database/odometer_schedulerMethod');

router.get('/', (req,res) => {
    res.send('Hello, this is dich vu route');
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const dichvu_arr = await dichvuMethod.print(usr_id);
        res.status(200).send({dichvu_arr});
    } catch (err) {
        console.log(err);
        res.status(500).send({err});
    }
});

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {

    //IMPORTANT: below is the list of foreign key values 
    // So that these values must alr exist in the database
    // They are: type_of_service, place
    
    const token = req.token;
    const inputFromClient = {odometer, type_of_service, amount, place, note, time, date} = req.body;
    
    const dichvu_UUID = uuid();
    const type_of_form = 'dichvu';
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        //Now. We add a row into dichvu table
        await dichvuMethod.insert(dichvu_UUID, usr_id, inputFromClient);
        
        
        //Second, Add a new row to All Form Table
        await historyMethod._all_form_insert_dichvu(usr_id, type_of_form, dichvu_UUID, {time, date});

        await odometer_schedulerMethod.push_notification_if_needed(usr_id, odometer);

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromClient
    = {form_id, odometer, type_of_service, amount, location, note, time, date}
    = req.body;

    try {
        await dichvuMethod._update(form_id, inputFromClient);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/delete', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const {form_id} = req.body;
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const query2 = await dichvuMethod.delete(usr_id, form_id);
        res.status(200).send({mess: `SUCCESSFUL deletete ${form_id}`});
    } catch (err) {
        res.status(500).send(err);
        console.log({ERR: err});
    }
});
module.exports = router;