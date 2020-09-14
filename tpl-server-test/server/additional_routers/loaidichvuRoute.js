const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const loaidichvuMethod = require('../additionals_database/loaidichvuMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {loaidichvu_name} = req.body;
        const trimmed_loaidichvu = loaidichvu_name.trim();
        const call_insert = await loaidichvuMethod._insert(usr_id, trimmed_loaidichvu);
        const {status, loaidichvu_id} = call_insert;
        if (status === true) {
            res.status(200).send({message: `Thêm thành công loại dịch vụ: ${loaidichvu_name}`, loaidichvu_id});;
        } else {
            res.status(400).send({message: `Loại dịch vụ: ${loaidichvu_name} đã tồn tại` });
        }
        
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of loaidichvu';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {used_arr, the_rest_arr} = await loaidichvuMethod._print(usr_id);
        res.status(200).send({title, used_arr, the_rest_arr});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;