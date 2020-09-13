const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const loaichiphiMethod = require('../additionals_database/loaichiphiMethod');

const router = express.Router();

router.post('/insert', Auth_IN_OUT.extractToken, async (req, res) => {
    try {  
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {loaichiphi_name} = req.body;
        const trimmed_loaichiphi = loaichiphi_name.trim();
        const status = await loaichiphiMethod._insert(usr_id, trimmed_loaichiphi);
        if (status === true) {
            res.status(200).send({message: `Thêm thành công loại chi phí: ${loaichiphi_name}`});;
        } else {
            res.status(400).send({message: `Loại chi phí: ${loaichiphi_name} đã tồn tại` })
        }
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
        const {used_arr, the_rest_arr} = await loaichiphiMethod._print(usr_id);
        res.status(200).send({title, used_arr, the_rest_arr});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;