const express = require('express');

const route = express.Router();
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const usersMethod = require('../database/usersMethod');
const allMethod = require('../database/allMethod');

route.get('/printall', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    const user_email = Auth_IN_OUT.emailFromToken(token);

    try {
        const id_usr = await usersMethod.getUID_byEmail(user_email);

        const all_row = await allMethod._return_all_form(id_usr);
        res.status(200).send({status: 'successful', total_rows: all_row.rowCount, data: all_row.rows});

    } catch (err) {
        console.log({message: 'failed at All Form Route', err});
    }

});

module.exports = route;