'use strict'

module.exports = {
    //@ts-ignore
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE thunhap(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date NOT NULL default now(),
            time timetz NOT NULL default now(),
            odometer decimal(7,1) NOT NULL,
            type_of_income int8 NOT NULL,
            amount integer NOT NULL,
            note text,
            FOREIGN KEY (type_of_income) REFERENCES loaithunhap (ID)
        );

            
    
        `, {raw: true});
    },

    //@ts-ignore
    down: async (queryInterface, Sequelize) => {  
        await queryInterface.sequelize.query(`
        
        
        `, {raw: true});
    },
};