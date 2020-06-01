'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE dichvu (
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date NOT NULL default now(),
            time timetz NOT NULL default now(),
            odometer decimal(7,1) NOT NULL,
            type_of_service text NOT NULL,
            amount int NOT NULL,
            location text NOT NULL,
            note text
        );
        
        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`




        `, {raw: true});
    }
}