'use strict';
const jwt = require('jsonwebtoken');

module.exports = {
    extractToken: (req,res,next) => {
        const header = req.headers['authorization'];
        if(!header) return res.send(400);
        const token = header.split(' ')[1];
        console.log('extracted token: ' + token);
        req.token = token;
        next();
    },
    emailFromToken: (token) => {
        try {
            const decoded = jwt.verify(token, 'drivvo');
            return decoded.email;
        } catch (err) {
            throw new Error('failed to verify');
        }
    }
}