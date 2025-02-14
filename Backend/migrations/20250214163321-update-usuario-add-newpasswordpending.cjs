'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'newPasswordPending', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Almacena la nueva contraseña (encriptada) pendiente de confirmación'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'newPasswordPending');
  }
};
