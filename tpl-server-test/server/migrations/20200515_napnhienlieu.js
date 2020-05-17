'use strict'

module.exports = {
    up: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        create table napnhienlieu(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            filling_date date default now(),
            filling_hour time default now(),
            odometer decimal(6,1) NOT NULL,
            type_of_fuel text,
            price_per_unit int,
            total_cost int,
            unit_amount decimal(5,2),
            full_tank bool,
            destination text
        );
        
        insert into napnhienlieu(odometer, type_of_fuel, price_per_unit, total_cost, unit_amount, full_tank, destination)
        values (123.4,'gasoline',20000, 50000, 2.5, true, 'dongnai');

        ` ,{raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`



        `, {raw: true});
    },
}