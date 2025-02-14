'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'newEmailPending', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Nuevo email pendiente de confirmación'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'newEmailPending');
  }
};
