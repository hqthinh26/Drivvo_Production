const express = require('express');
const napNLMethod = require('../database/napNLMethod');

const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).send('this is nap nhien lieu route');
})

router.get('/printall',napNLMethod.getAllTable);

module.exports = router;