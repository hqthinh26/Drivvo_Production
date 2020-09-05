const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const deviceMethod = require('../database/deviceMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {deviceID} = req.body;
        await deviceMethod.insert(usr_id, deviceID);
        res.status(200).send({message: 'access insert device id thanh cong'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports = router;