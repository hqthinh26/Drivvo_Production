'use strict'

module.exports = {
    up: async (queryInterface,Sequelize) => {
        queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE chiphi (
            id uuid PRIMARY KEY default uuid_generate_v4(),
            date date NOT NULL default now(),
            hour timetz NOT NULL default now(),
            odometer decimal(7,1),
            type_of_expense text NOT NULL,
            location varchar(50),
            reason text
        );
        
        INSERT INTO chiphi (odometer, type_of_expense, location, reason) 
        VALUES (123456.9, 'Lunch Meal', 'Hoc Mon', 'Exhausted! must buy food'),
               (456789.5, 'Milk tea', 'Nguyen Huu cau', 'Thirsty for milk tea');
               
        `,{raw: true});
    },
    down: async (queryInterface,Sequelize) => {
        queryInterface.sequelize.query(`
        
        
        
        
        
        `,{raw:true})
    },
}