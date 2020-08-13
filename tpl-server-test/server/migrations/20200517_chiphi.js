'use strict'
//ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';
module.exports = {
    up: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`

        
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE chiphi (
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid,
            date date NOT NULL,
            time timetz NOT NULL,
            odometer decimal(7,1) NOT NULL,
            type_of_expense int8 NOT NULL,
            amount int NOT NULL,
            place int8,
            reason int8,
            note text,
            FOREIGN KEY (u_id) REFERENCES users (u_id),
            FOREIGN KEY (type_of_expense) REFERENCES loaichiphi (ID),
            FOREIGN KEY (place) REFERENCES diadiem (ID),
            FOREIGN KEY (reason) REFERENCES lydo (ID)
        );
               
        `,{raw: true});
    },
    down: async (queryInterface,Sequelize) => {
        await queryInterface.sequelize.query(`
        
        
        
        
        
        `,{raw:true})
    },
}