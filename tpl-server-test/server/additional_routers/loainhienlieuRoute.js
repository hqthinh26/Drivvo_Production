const express = require('express');
const router = express.Router();
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');

//Inserting component
const loainhienlieuMethod = require('../additionals_database/loainhienlieuMethod');

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {

    const token = req.token;

    try {
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {loainhienlieu_name} = req.body;

        //Use method TRIM() to remove whitespaces on the 2 ends
        const trimmed_loainhienlieu = loainhienlieu_name.trim();
        console.warn(trimmed_loainhienlieu);
        const status = await loainhienlieuMethod._insert(usr_id, trimmed_loainhienlieu);
        if (status === true) {
            res.status(200).send({message: `Thêm thành công loại nhiên liệu: ${loainhienlieu_name}`});
        } else {
            res.status(400).send({message: `Loại nhiên liệu ${loainhienlieu_name} đã tồn tại` })
        }
        
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of loainhienlieu';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {used_arr, the_rest_arr} = await loainhienlieuMethod._print(usr_id);
        res.status(200).send({title, used_arr, the_rest_arr});
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;