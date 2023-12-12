'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Articles', 'title');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Articles', 'title', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
  }
};