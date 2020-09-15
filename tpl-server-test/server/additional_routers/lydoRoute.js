const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const lydoMethod = require('../additionals_database/lydoMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {lydo_name} = req.body;
        const trimmed_lydo = lydo_name.trim();

        const call_insert = await lydoMethod._insert(usr_id, trimmed_lydo);
        const {status, lydo_id} = call_insert;
        if (status === true) {
            res.status(200).send({message: `Thêm thành công lý do: ${lydo_name}`, lydo_id});
        }
        res.status(400).send({message: `Lý do: ${trimmed_lydo} đã tồn tại`});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of lydo updating';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {used_arr, the_rest_arr} = await lydoMethod._print(usr_id);
        res.status(200).send({title, used_arr, the_rest_arr});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;