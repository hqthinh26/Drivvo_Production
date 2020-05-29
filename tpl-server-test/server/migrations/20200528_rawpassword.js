'use strict'


module.exports = {
    //@ts-ignore
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE rawpassword(
            id uuid PRIMARY KEY default uuid_generate_v4(),
            u_id uuid REFERENCES users(u_id),
            raw_pw text NOT NULL
        );

        `, {raw: true});
    },

    //@ts-ignore
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`



        `, {raw: true});
    }
}