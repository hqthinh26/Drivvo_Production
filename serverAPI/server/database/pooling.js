const {Pool} = require('pg');

const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'company',
    database: 'company',
    password: 'abcdef1234',
});

module.exports = pool;