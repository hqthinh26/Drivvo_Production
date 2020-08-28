'use strict'
//ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        CREATE TABLE nhacnho(
            id uuid PRIMARY KEY,
            usr_id uuid REFERENCES users(u_id) NOT NULL,
            type_of_expense bool NOT NULL,
            type_of_service bool NOT NULL,
            name_of_nhacnho text NOT NULL,
            is_one_time bool NOT NULL,
            OT_at_odometer decimal(7,1),
            OT_at_date date,
            RR_at_km_range int,
            RR_period text,
            CONSTRAINT only_one_exists CHECK (type_of_expense != type_of_service)
        );
        `, {raw: true})
    },
    
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
      
      

      
    `, {raw: true}) 
    }
}

// CREATE TABLE nhacnho (
//     id uuid PRIMARY KEY,
//     usr_id uuid REFERENCES users(u_id) NOT NULL,
//     name_of_reminder text NOT NULL, 
//     one_time_reminder bool NOT NULL,
//     repeat_reminder bool NOT NULL,
//     OTR_km  int,
//     OTR_date date,
//     RR_km int,
//     RR_period text,
//     note text,
//     CONSTRAINT only_one_exists CHECK (one_time_reminder != repeat_reminder)
// );