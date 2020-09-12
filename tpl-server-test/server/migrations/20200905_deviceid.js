'use strict'
//ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

module.exports = {
    up: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE deviceid(
            ID serial4 PRIMARY KEY,
            usr_id uuid NOT NULL,
            device_unique_id text,
            created_at timestamptz default now(),
            FOREIGN KEY (usr_id) REFERENCES users (u_id)
          );
        
        ` ,{raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`



        `, {raw: true});
    },
}