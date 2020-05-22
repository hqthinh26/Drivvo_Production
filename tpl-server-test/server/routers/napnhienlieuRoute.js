const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const napNLMethod = require('../database/napNLMethod');
const usersMethod = require('../database/usersMethod');

const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send('this is nap nhien lieu route');
})

router.get('/printall',napNLMethod.printall);

//token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRwbG9jX2d2QGdtYWlsLmNvbSIsInB3IjoiMDEyMzQ1bG9jIiwiaWF0IjoxNTg5OTU2NTIyfQ.Q68UHaVPaid6dHgz9mwXJ3wvZ44irfMzWLaS9jiY1WE

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    //Get email from the token
    const user_email = Auth_IN_OUT.emailFromToken(req.token);

    //get u_id of the user based on their login email
    //Napnhienlieu table has a foreign key that links to User's ID
    const u_id = await usersMethod.getUID_byEmail(user_email);

    const inputFromClient = {date, time, odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location} = req.body;
    console.log(inputFromClient);
    
    try {
        await napNLMethod.insert(inputFromClient,u_id);
    }  
    catch (err) {throw new Error('Failed at post add NLL');}
    
    return  res.send('successful');
   
});

module.exports = router;