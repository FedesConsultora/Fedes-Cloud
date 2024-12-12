// migrations/XXXXXXXXXXXXXX-add-two-factor-temp-fields-to-usuario.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuario', 'twoFactorTempToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Usuario', 'twoFactorTempExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuario', 'twoFactorTempToken');
    await queryInterface.removeColumn('Usuario', 'twoFactorTempExpires');
  }
};
