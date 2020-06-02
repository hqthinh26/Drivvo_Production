'use strict';
const jwt = require('jsonwebtoken');
// @ts-ignore

const tokenMethod = require('../database/tokenMethod');
module.exports = {
// @ts-ignore
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

    // @ts-ignore
    emailFromToken: (token) => {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY2);
            return decoded.email;
        } catch (err) {
            throw new Error('failed to verify');
        }
    }
}