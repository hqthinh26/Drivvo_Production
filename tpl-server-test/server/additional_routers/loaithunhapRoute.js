const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const loaithunhapMethod = require('../additionals_database/loaithunhapMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {loaithunhap_name} = req.body;
        await loaithunhapMethod._insert(usr_id, loaithunhap_name);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of loaithunhap';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const data = await loaithunhapMethod._print(usr_id);
        res.status(200).send({title, data});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;