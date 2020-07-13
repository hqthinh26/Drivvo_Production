'use strict'

module.exports = {
    up: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        create table napnhienlieu(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date,
            time timetz,
            odometer decimal(7,1) NOT NULL,
            type_of_fuel int8 NOT NULL,
            price_per_unit int NOT NULL,
            total_cost int NOT NULL,
            total_units decimal(5,2),
            full_tank bool,
            gas_station int8,
            reason int8,
            FOREIGN KEY (type_of_fuel) REFERENCES loainhienlieu (ID),
            FOREIGN KEY (gas_station) REFERENCES tramxang (ID),
            FOREIGN KEY (reason) REFERENCES lydo (ID)
        );
        
        ` ,{raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`



        `, {raw: true});
    },
}