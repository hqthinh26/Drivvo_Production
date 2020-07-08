const express = require('express');
const router = express.Router();
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const tramxangMethod = require('../additionals_database/tramxangMethod');

router.post('/insert', Auth_IN_OUT.extractToken, async (req,res) => {

    try {
        const token = req.token;
        const {tramxang_name} = req.body;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        await tramxangMethod._insert(usr_id, tramxang_name);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/print', Auth_IN_OUT.extractToken, async (req,res) => {
    try {
        const token = req.token;
        const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
        const array_of_tramxang = await tramxangMethod._print(usr_id);
        res.status(200).send({array_of_tramxang});
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;