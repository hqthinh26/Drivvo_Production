'use strict'

module.exports = {
    up: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        create table napnhienlieu(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date default now(),
            time timetz default now(),
            odometer decimal(7,1) NOT NULL,
            type_of_fuel text NOT NULL,
            price_per_unit int NOT NULL,
            total_cost int NOT NULL,
            total_units decimal(5,2),
            full_tank bool,
            location text
        );
        
        insert into napnhienlieu(odometer, type_of_fuel, price_per_unit, total_cost, total_units, full_tank, location)
        values (123.4, 'gasoline', 20000,  50000, 2.5, true, 'dongnai'),
               (12333.5, 'refine oil', 11500, 231000, 3.4, true, 'America');

        ` ,{raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`



        `, {raw: true});
    },
}