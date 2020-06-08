const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const thunhapMethod = require('../database/thunhapMethod');
const usersMethod = require('../database/usersMethod');
const historyMethod = require('../database/historyMethod');
const {uuid} = require('uuidv4');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('hello, welcome to thunhap root route');
})

router.get('/printall', thunhapMethod.printall);

router.post('/insert',Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const inputFromUser = {odometer, type_of_income, amount, note, date, time} = req.body;
    const thunhap_UUID = uuid();
    try {
        
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const type_of_form = 'thunhap';

        // Step 1: Add a new row to Thu Nhap Table
        await thunhapMethod.insert(thunhap_UUID,usr_id,inputFromUser);

        // Step 2: Add a new row to All Form Table 
        await historyMethod._all_form_insert_thunhap(usr_id, type_of_form, thunhap_UUID, inputFromUser)
        
        return res.sendStatus(200);
    } catch (err) {
        console.log(err.detail);
        return res.status(403).send({message: 'something is wrong in the insert route', detail: err.detail});
    }
});

router.put('/update', Auth_IN_OUT.extractToken, async (req,res) => {
    const inputFromUser 
    = {form_id, odometer, type_of_income, amount, note, time, date}
    = req.body;
    console.log(inputFromUser);
    try {
        await thunhapMethod._update(form_id, inputFromUser);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send({message: 'failed at update thu nhap route', err})
    }
})
module.exports = router;