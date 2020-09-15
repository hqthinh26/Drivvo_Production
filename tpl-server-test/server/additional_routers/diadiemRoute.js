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
        const {used_arr, the_rest_arr} = await diadiemMethod._print(usr_id);
        res.status(200).send({title, used_arr, the_rest_arr});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/print_black_list', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const black_listed = await diadiemMethod._print_black_list(usr_id);
        res.status(200).send({black_listed});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.put('/add_to_black_list', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {diadiem_id} = req.body;

        const post_value = await diadiemMethod._add_to_black_list(usr_id, diadiem_id);
        res.status(200).send({is_black_listed_now: post_value});
    } catch (err) {
        throw new Error(err);
    }
});

router.put('/remove_from_black_list', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {diadiem_id} = req.body;

        const post_value = await diadiemMethod._remove_from_black_list(usr_id, diadiem_id);
        res.status(200).send({is_black_listed_now: post_value});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }  
})
module.exports = router;