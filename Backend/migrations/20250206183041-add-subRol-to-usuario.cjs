'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'subRol', {
      type: Sequelize.ENUM('No configurado', 'Administrador', 'Facturación', 'Registrante', 'Técnico'),
      allowNull: true,
      defaultValue: 'No configurado',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'subRol');
  }
};
