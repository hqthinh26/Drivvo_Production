'use strict';

module.exports = {
    extractToken: (req,res,next) => {
        const header = req.headers['authorization'];
        if(!header) return res.send(400);
        const token = header.split(' ')[1];
        console.log('extracted token: ' + token);
        req.token = token;
        next();
    }
}