// const mysql = require('mysql');
const { Pool, Client } = require('pg-promise');

const pgp = require('util');

// const pool = mysql.createPool({
//   connectionLimit: 100,
//   host: 'localhost',
//   port: '5432',
//   user: 'company',
//   password: 'asdfsdfa',
//   database: 'company'
// });

// const pool_query = promisify(pool.query).bind(pool);

// module.exports = {
//   load: sql => pool_query(sql),
//   add: (entity, tableName) => pool_query(`insert into ${tableName} set ?`, entity),
//   del: (condition, tableName) => pool_query(`delete from ${tableName} where ?`, condition),
//   patch: (entity, condition, tableName) => pool_query(`update ${tableName} set ? where ?`, [entity, condition]),
// };

const cn = {
  user: 'company',
  host: 'localhost',
  database: 'company',
  password: 'abcdef1234',
  port: 5432,
};

module.exports = {
  load: sql => {
    db.one(sql)
    .then(user => {
        console.log(user.name); // print user name;
    })
    .catch(error => {
        console.log(error); // print the error;
    });
  },

  add: (entity, tableName) => {
    //...
  },

  del: (condition, tableName) => {
    // pool_query(`delete from ${tableName} where ?`, condition)
  },

  patch: (entity, condition, tableName) => {
    // pool_query(`update ${tableName} set ? where ?`, [entity, condition])
  },
};
