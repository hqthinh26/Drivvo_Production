'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE allform(
            id bigserial PRIMARY KEY,
            id_usr uuid REFERENCES users(u_id) NOT NULL,
            type_of_form text NOT NULL,
            id_private_form uuid NOT NULL,
            odometer decimal(7,1) NOT NULL,
            type_of_fuel text,
            price_per_unit int,
            total_cost int,
            total_units decimal(5,2),
            full_tank bool,
            type_of_expense text,
            type_of_service text,
            type_of_income text,
            amount int,
            note text,
            location text,
            date date,
            time time
        );
        
        `, {raw: true});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(``, {raw: true});
    }
}