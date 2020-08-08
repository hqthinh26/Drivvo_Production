'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
    
        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE history(
            id bigserial PRIMARY KEY,
            usr_id uuid REFERENCES users(u_id) NOT NULL,
            type_of_form text NOT NULL,
            id_private_form uuid NOT NULL,
            created_at_time timetz NOT NULL,
            created_at_date date NOT NULL
        );     
        `, {raw: true});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
      
      

      
    `, {raw: true}) 
    }
}