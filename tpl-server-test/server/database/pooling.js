const {Pool} = require('pg');

const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'company',
    database: 'companyx',
    password: 'abcdef1234',
    max: 20,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 1000,
    
});

module.exports = pool;