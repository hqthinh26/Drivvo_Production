const {Pool} = require('pg');

const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'company',
    database: 'company',
    password: 'abcdef1234',
    max: 20,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 1000,
});

// const pool = new Pool({
//     host: 'ec2-52-44-166-58.compute-1.amazonaws.com',
//     port: 5432,
//     user: 'pzjtzfyxirzlbo',
//     database: 'd71babp6b76q45',
//     password: 'df29fe06f942fe56b71376aafe5582c59c410fd5b353a2c380ce44102f233e32',
//     max: 20,
//     connectionTimeoutMillis: 0,
//     idleTimeoutMillis: 1000,
// });

module.exports = pool;