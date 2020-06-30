const route = require('express').Router();
const {uuid} = require('uuidv4');
const dichvuMethod = require('../database/dichvuMethod');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const usersMethod = require('../database/usersMethod');
const historyMethod = require('../database/historyMethod');

route.get('/', (req,res) => {
    res.send('Hello, this is dich vu route');
})

route.get('/printall', dichvuMethod.printall);

route.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {

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

        res.sendStatus(200);
    } catch (err) {
        console.log({ERR: err});
        return res.sendStatus(500);
    }
});

route.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromClient
    = {form_id, odometer, type_of_service, amount, location, note, time, date}
    = req.body;

    try {
        await dichvuMethod._update(form_id, inputFromClient);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send({message: 'failed at update dich vu route', err});
    }
});

module.exports = route;