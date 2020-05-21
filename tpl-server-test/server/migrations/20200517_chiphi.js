'use strict'

module.exports = {
    up: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE chiphi (
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users (u_id),
            date date NOT NULL default now(),
            hour timetz NOT NULL default now(),
            odometer decimal(7,1),
            type_of_expense text NOT NULL,
            amount int NOT NULL,
            location varchar(50),
            reason text
        );
        
        INSERT INTO chiphi (odometer, type_of_expense, amount, location, reason) 
        VALUES (123456.9, 'Lunch Meal',1500000, 'Hoc Mon', 'Exhausted! must buy food'),
               (456789.5, 'Milk tea', 2000000,'Nguyen Huu cau', 'Thirsty for milk tea');
               
        `,{raw: true});
    },
    down: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`
        
        
        
        
        
        `,{raw:true})
    },
}