
const route = require('express').Router();
const dichvuMethod = require('../database/dichvuMethod');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const usersMethod = require('../database/usersMethod');

route.get('/', (req,res) => {
    res.send('Hello, this is dich vu route');
})

route.get('/printall', dichvuMethod.printall);

route.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const u_email = Auth_IN_OUT.emailFromToken(token);
    const inputFromClient = {date, time, odometer, type_of_service, amount, location, note} = req.body;
    
    try {
        const u_id = await usersMethod.getUID_byEmail(u_email);
        //Now. We add a row into dichvu table
        await dichvuMethod.insert(inputFromClient,u_id);
        res.sendStatus(200);
    } catch (err) {
        console.log({message: err.detail});
        return res.status(403).send({message: 'something is wrong in the /insert route', detail: err.detail});
    }
})

module.exports = route;