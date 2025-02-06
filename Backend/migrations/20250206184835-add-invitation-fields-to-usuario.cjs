'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'invitationToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Usuario', 'invitationTokenExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'invitationToken');
    await queryInterface.removeColumn('Usuario', 'invitationTokenExpires');
  }
};
