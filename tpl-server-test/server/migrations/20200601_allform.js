'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE allformdetail(
            id_form_detail uuid PRIMARY KEY default uuid_generate_v4(),
            type_of_form text NOT NULL, 
            id_nnl uuid references napnhienlieu(id),
            id_chiphi uuid references chiphi(id),
            id_dichvu uuid references dichvu(id),
            id_thunhap uuid references thunhap(id)
        );

        CREATE TABLE allform(
            id_all bigserial PRIMARY KEY,
            id_usr uuid REFERENCES users(u_id) NOT NULL,
            id_form_detail uuid REFERENCES allformdetail(id_form_detail) NOT NULL,
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