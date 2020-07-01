const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const lydoMethod = require('../additionals_database/lydoMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {lydo_name} = req.body;
        await lydoMethod._insert(usr_id, lydo_name);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const array_of_lydo = await lydoMethod._print(usr_id);
        res.status(200).send({array_of_lydo});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;