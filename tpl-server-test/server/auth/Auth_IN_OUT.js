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
        return res.status(403).send('the token is not valid becuz the user has logout');
    },

    emailFromToken: (token) => {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY2);
            return decoded.email;
        } catch (err) {
            throw new Error('failed to verify');
        }
    },

    _usr_id_from_token: async (token) => {
        const decoded = jwt.verify(token,process.env.SECRET_KEY2);
        const {email} = decoded;

        const results = await pool.query(`select u_id from users where u_email = $1`, [email]);
        return usr_id = results.rows[0].u_id;
    }
}