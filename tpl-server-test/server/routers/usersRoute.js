const usersMethod = require('../database/usersMethod');
const express = require('express');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('This is user Route');
})

router.get('/printall', usersMethod.printall);

router.post('/insert', usersMethod.insert);

module.exports = router;
