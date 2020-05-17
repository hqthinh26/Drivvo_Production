const express = require('express');
const chiphiMethod = require('../database/chiphiMethod');

const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send("Hello, this is chiphi Route");
})

router.get('/printall', chiphiMethod.getAll);

router.post('/insert',chiphiMethod.insert);

module.exports = router;