'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE thunhap(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date NOT NULL default now(),
            hour timetz NOT NULL default now(),
            odometer decimal(7,1) NOT NULL,
            amount integer NOT NULL,
            type_of_income text NOT NULL,
            note text
        );

        INSERT INTO thunhap (odometer, amount, type_of_income, note)
        VALUES (123456.7, 100000, 'Package Handling Service', 'Good amount of quick money'),
               (234567.8, 200000, 'AirBnB', 'Customers are really dirty and mean');
               
        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {  
        await queryInterface.sequelize.query(`
        
        
        `, {raw: true});
    },
};