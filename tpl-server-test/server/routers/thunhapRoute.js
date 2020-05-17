const express = require('express');
const thunhapMethod = require('../database/thunhapMethod');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('hello, welcome to thunhap router root route');
})

router.get('/printall', thunhapMethod.printall);

module.exports = router;