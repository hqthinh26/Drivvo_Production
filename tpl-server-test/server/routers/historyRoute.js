const express = require('express');

const route = express.Router();
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');
const historyMethod = require('../database/historyMethod');

route.get('/printall/:rows', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;

    try {

       const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
       console.log(`usr_id : ${usr_id}`)

        //historyMethod._return_all_form returns the array of all matched rows
        const number_of_rows = req.params.rows; // the number of  rows  will be choosen to be presented
        const result_array_all_form = await historyMethod._return_all_form(usr_id,number_of_rows);
        const array_of_type = result_array_all_form.map((each_form) => each_form.type_of_form);

        const result_array_detail=  await Promise.all(result_array_all_form.map((each_form) => historyMethod._return_detail_each_form(each_form)));

        const result_array_final = result_array_detail.map((eachValue) => eachValue.rows[0]);
        res.status(200).send({status: 'successful', array_of_type, result_array_final});

    } catch (err) {
        console.log({message: 'failed at All Form Route', err});
    }

});

module.exports = route;