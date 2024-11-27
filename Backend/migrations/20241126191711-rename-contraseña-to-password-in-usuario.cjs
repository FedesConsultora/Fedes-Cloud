// migrations/xxxxxx-rename-contraseña-to-password-in-usuario.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Usuario', 'contraseña', 'password');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Usuario', 'password', 'contraseña');
  },
};
