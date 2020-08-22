'use strict';
const jwt = require('jsonwebtoken');

const tokenMethod = require('../database/tokenMethod');
const pool = require('../database/pooling');
module.exports = {

    extractToken: async (req, res, next) => {
        const header = req.headers['authorization'];
        if(!header) return res.status(403).send({message: 'Authorization: token is empty'})
        const rawToken = header.split(' ')[1];
        //check the database to confirm that the token exists - meaning that the user has loggined
        const exist = await tokenMethod.tokenExist(rawToken);
        if (exist) {
            req.token = rawToken;
            return next();
        }
        return res.status(403).send('the token doesnt exist in database');
    },

    _usr_id_from_token: async (token) => {
        try {
            const decoded = jwt.verify(token,process.env.SECRET_KEY2);
            const {email} = decoded;
            const results = await pool.query(`select u_id from users where u_email = $1`, [email]);
            const usr_id = results.rows[0].u_id;
            return usr_id;
        } catch (err) {
            throw new Error({message: 'failed at usr_id_form_token', err})
        }
        
    }
}