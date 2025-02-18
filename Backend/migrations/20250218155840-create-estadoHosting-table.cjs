'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EstadoHosting', {
      id_estado_hosting: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del estado (ej: "Pendiente", "Activo", "Suspendido", "Cancelado")',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EstadoHosting');
  },
};
