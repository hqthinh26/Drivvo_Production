'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE dichvu (
            id uuid PRIMARY KEY default uuid_generate_v4(),
            date date NOT NULL default now(),
            hour timetz NOT NULL default now(),
            odometer decimal(7,1) NOT NULL,
            type_of_service text NOT NULL,
            location text NOT NULL,
            note text
        );

        INSERT INTO dichvu (odometer, type_of_service, location, note) 
        VALUES (45677.4, 'Car-washing', 'Cong Hoa Tan Binh', 'Good service - The employees are friendly and helping'),
               (53643.1, 'Wheel replacement', 'Trung Chanh Intersection', 'The replacement parts are overpriced. 1 star for the service');
        
        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`




        `, {raw: true});
    }
}