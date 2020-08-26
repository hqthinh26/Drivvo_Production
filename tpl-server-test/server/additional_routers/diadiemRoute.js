const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const diadiemMethod = require('../additionals_database/diadiemMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {diadiem_name} = req.body;
        await diadiemMethod._insert(usr_id, diadiem_name);
        res.status(200).send({message: `Thêm thành công địa điểm: ${diadiem_name}`});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of diadiem';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const data = await diadiemMethod._print(usr_id);
        res.status(200).send({title ,data});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;