const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const loaichiphiMethod = require('../additionals_database/loaichiphiMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {loaichiphi_name} = req.body;
        await loaichiphiMethod._insert(usr_id, loaichiphi_name);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of loaichiphi';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const data = await loaichiphiMethod._print(usr_id);
        res.status(200).send({title, data});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;