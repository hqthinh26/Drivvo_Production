'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.sequelize.query(`
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE thunhap(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            Date date NOT NULL default now(),
            Hour timetz NOT NULL default now(),
            Odometer decimal(7,1) NOT NULL,
            Amount integer NOT NULL,
            Type_of_income text NOT NULL,
            Note text
        );

        INSERT INTO thunhap(Odometer, Amount, Type_of_income, Note)
        VALUES (123456.7, 100000, 'Package Handling Service', 'Good amount of quick money');
        
        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {  
        queryInterface.sequelize.query(`
        

        
        `, {raw: true});
    },
};