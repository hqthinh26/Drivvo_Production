'use strict'

module.exports = {
    up: async (queryInterface,Sequelize) => {
        queryInterface.sequelize.query(`

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE chiphi(
            ID uuid PRIMARY KEY default uuid_generate_v4 (),
            Date date NOT NULL default now(),
            Hour timetz NOT NULL default now(),
            Odometer decimal()
            Type_of_expense text NOT NULL,
            Location varchar(50),
            Reason text
        );
        
        `,{raw: true});
    },
    down: async (queryInterface,Sequelize) => {
        queryInterface.sequelize.query(`
        
        
        
        
        
        `,{raw:true})
    },
}