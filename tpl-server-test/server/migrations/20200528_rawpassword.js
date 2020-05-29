'use strict'


module.exports = {
    //@ts-ignore
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`

        create table rawpassword(
            id uuid PRIMARY KEY,
            userID uuid REFERENCES users(u_id),
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