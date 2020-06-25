'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE quangduong(
            id uuid PRIMARY KEY,
            usr_id uuid REFERENCES users(u_id) NOT NULL,
            origin text NOT NULL,
            start_time time NOT NULL,
            start_date date NOT NULL,
            initial_odometer decimal(7,1) NOT NULL,
            destination text NOT NULL,
            end_time timetz NOT NULL,
            end_date date NOT NULL,
            final_odometer decimal(7,1) NOT NULL,
            value_per_km int NOT NULL,
            total int NOT NULL,
            reason text,
            CONSTRAINT valid_end_date CHECK (end_date >= start_date),
            CONSTRAINT valid_final_odometer CHECK (final_odometer >= initial_odometer)
        );
        
        `, {raw: true});
    },
    
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        
        `, {raw: true});
    },
}