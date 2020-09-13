const express = require('express');
const router = express.Router();
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const tramxangMethod = require('../additionals_database/tramxangMethod');

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {

    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

        const {tramxang_name} = req.body;
        const trimmed_tramxang = tramxang_name.trim();

        const status = await tramxangMethod._insert(usr_id, trimmed_tramxang);

        if (status === true) {
            res.status(200).send({message: `Thêm thành công trạm xăng: ${tramxang_name}`});
        } else  {
            res.status(400).send({message: `Trạm xăng: ${tramxang_name} đã tồn tại` });
        }

        
    } catch (err) {
        console.log(err);
        res.sendStatus(500);  
    }
});

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const title = 'List of tramxang';
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {used_arr, the_rest_arr} = await tramxangMethod._print(usr_id);
        res.status(200).send({title, used_arr, the_rest_arr});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/print_black_list', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const black_listed = await tramxangMethod._print_black(usr_id);
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
        const {tramxang_id} = req.body;

        const result = await tramxangMethod._add_to_black_list(usr_id, tramxang_id);
        res.status(200).send({message: 'thanh cong', is_black_listed: result});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.put('/remove_from_black_list', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const {tramxang_id} = req.body;

        const result = await tramxangMethod._remove_from_black_list(usr_id, tramxang_id);
        res.status(200).send({message: 'Thanh cong', result});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})
module.exports = router;