// migrations/XXXXXXXXXXXXXX-add-googleId-to-usuario.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'googleId', {
      type: Sequelize.STRING,
      allowNull: true, 
      unique: true, 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'googleId');
  }
};

