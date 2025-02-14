'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrdenDetalleHistorial', {
      id_historial: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_detalle: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      estadoAnterior: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      estadoNuevo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      fechaCambio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // FK a 'OrdenDetalle'
    await queryInterface.addConstraint('OrdenDetalleHistorial', {
      fields: ['id_detalle'],
      type: 'foreign key',
      name: 'fk_historial_detalle',
      references: {
        table: 'OrdenDetalle',
        field: 'id_detalle',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // FK a 'Usuario' (quien hizo el cambio)
    await queryInterface.addConstraint('OrdenDetalleHistorial', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_historial_autor',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrdenDetalleHistorial');
  },
};
