'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EstadoOrden', {
      id_estado_orden: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del estado (ej: "Pendiente", "Pagado", "Completado", "Cancelado")',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EstadoOrden');
  },
};
