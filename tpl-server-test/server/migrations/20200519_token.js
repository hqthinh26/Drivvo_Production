'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`

        ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

        CREATE TABLE token(
            id bigserial PRIMARY KEY,
            token_value text,
            created_at timestamptz default now()
        );

        `, {raw: true});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        
        
        `, {raw: true});
    }
}