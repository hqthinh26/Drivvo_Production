'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE token(
            id bigserial PRIMARY KEY,
            u_id uuid REFERENCES users (u_id),
            token_value text NOT NULL,
            created_at timestamptz default now()
        );

        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
      
      

      
    `, {raw: true}) 
    }
}