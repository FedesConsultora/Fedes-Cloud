// migrations/XXXXXXXXXXXXXX-add-two-factor-secret-to-usuario.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuario', 'twoFactorSecret', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuario', 'twoFactorSecret');
  }
};
