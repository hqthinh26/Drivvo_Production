const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const diadiemMethod = require('../additionals_database/diadiemMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {diadiem_name} = req.body;
        const trimmed_diadiem = diadiem_name.trim();
        const call_insert = await diadiemMethod._insert(usr_id, trimmed_diadiem);
        
        const {status, diadiem_id} = call_insert;
        if(status === true) {
            res.status(200).send({message: `Thêm thành công địa điểm: ${diadiem_name}`, diadiem_id});
        }
        else {
            res.status(400).send({message: `Địa điểm ${diadiem_name} đã tồn tại`});
        }
        
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