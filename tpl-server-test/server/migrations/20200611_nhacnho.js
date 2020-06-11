'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        CREATE TABLE nhacnho (
            id uuid PRIMARY KEY,
            usr_id uuid REFERENCES users(u_id) NOT NULL,
            name_of_reminder text NOT NULL, 
            one_time_reminder bool NOT NULL,
            repeat_reminder bool NOT NULL,
            OTR_km  int,
            OTR_date date,
            RR_km int,
            RR_period text,
            note text,
            CONSTRAINT only_one_exists CHECK (one_time_reminder != repeat_reminder)
        );

        `, {raw: true})
    },
    
    down: async (queryInterface, Sequelize) => {

    }
}