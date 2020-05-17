
const route = require('express').Router();
const dichvuMethod = require('../database/dichvuMethod');

route.get('/', (req,res) => {
    res.send('Hello, this is dich vu route');
})

route.get('/printall', dichvuMethod.printall);

module.exports = route;