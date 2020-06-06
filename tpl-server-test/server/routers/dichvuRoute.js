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
    const token = req.token;
    const u_email = Auth_IN_OUT.emailFromToken(token);
    const inputFromClient = {odometer, type_of_service, amount, location, note, date, time} = req.body;
    
    const dichvu_UUID = uuid();
    const type_of_form = 'dichvu';
    try {
        const usr_id = await usersMethod.getUID_byEmail(u_email);
        //Now. We add a row into dichvu table
        await dichvuMethod.insert(dichvu_UUID, usr_id, inputFromClient);
        
        //Second, Add a new row to All Form Table
        await historyMethod._all_form_insert_dichvu(usr_id, type_of_form, dichvu_UUID, {time, date});

        res.sendStatus(200);
    } catch (err) {
        console.log({message: err.detail});
        return res.status(403).send({message: 'something is wrong in the /insert route', detail: err.detail});
    }
})

module.exports = route;