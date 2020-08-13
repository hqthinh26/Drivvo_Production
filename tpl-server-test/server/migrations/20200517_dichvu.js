'use strict'
//ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE dichvu (
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date NOT NULL,
            time timetz NOT NULL,
            odometer decimal(7,1) NOT NULL,
            type_of_service int8 NOT NULL,
            amount int NOT NULL,
            place int8 ,
            note text,
            FOREIGN KEY (type_of_service) REFERENCES loaidichvu (ID),
            FOREIGN KEY (place) REFERENCES diadiem (ID)
        );
        
        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`




        `, {raw: true});
    }
}