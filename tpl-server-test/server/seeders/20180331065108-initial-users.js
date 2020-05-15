'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      
      
    `, {raw: true})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      
    `, {raw: true});
  }
};
