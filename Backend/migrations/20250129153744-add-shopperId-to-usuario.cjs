// migrations/XXXXXXXXXXXXXX-add-shopperId-to-usuario.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'shopperId', {
      type: Sequelize.STRING,
      allowNull: true, // Puede ser null hasta que se asigne
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'shopperId');
  }
};
