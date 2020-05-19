'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE users(
            u_id uuid PRIMARY KEY default uuid_generate_v4(),
            u_fullname text NOT NULL,
            u_phone text NOT NULL,
            u_email text NOT NULL UNIQUE,
            u_pw text NOT NULL
        );

        INSERT INTO users(u_fullname, u_phone, u_email, u_pw) 
        VALUES ('tploc', '012345', 'tploc_gv@gmail.com', '012345loc'),
               ('hqthinh', '023456', 'hqthinh_sv@gmail.com', '023456thinh'),
               ('vhaquan', '034567', 'vhaquan_sv@gmail.com', '034567quan');
        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        
        
        `, {raw: true});
    }
}