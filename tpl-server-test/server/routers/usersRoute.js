const usersMethod = require('../database/usersMethod');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const express = require('express');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('This is user Route');
})

//router.get('/printall', usersMethod.printall);

router.get('/user_info', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {fullname, email} = await usersMethod.user_name_email(usr_id);
        res.status(200).send({fullname, email});
    } catch (err) {
        console.log(err);
        res.status(500).send({err});
    }
})

module.exports = router;
