'use strict';
const jwt = require('jsonwebtoken');

module.exports = {
    extractToken: (req,res,next) => {
        const header = req.headers['authorization'];
        if(!header) {
            res.send('You must send token');
            throw new Error('cannot find token');
        }
        const token = header.split(' ')[1];
        console.log('extracted token: ' + token);
            
        jwt.verify(token, 'drivvo', (err,decoded) => {
            if(err) { 
                res.send('invalid token');
                throw Error('invalid token');
            }
            req.token = token;
            next();
        });
        return;
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