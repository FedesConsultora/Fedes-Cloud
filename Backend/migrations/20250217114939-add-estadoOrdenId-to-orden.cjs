'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Agregar columna estadoOrdenId con un valor por defecto (asumimos que "Pendiente" tiene id 1)
    await queryInterface.addColumn('Orden', 'estadoOrdenId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: 'Referencia al estado de la orden en EstadoOrden',
    });

    // 2. Agregar restricción de clave foránea
    await queryInterface.addConstraint('Orden', {
      fields: ['estadoOrdenId'],
      type: 'foreign key',
      name: 'fk_orden_estadoorden',
      references: {
        table: 'EstadoOrden',
        field: 'id_estado_orden',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 3. Eliminar la columna "estado" ya que es redundante
    await queryInterface.removeColumn('Orden', 'estado');
  },

  async down(queryInterface, Sequelize) {
    // Para revertir, primero agregar de nuevo la columna "estado"
    await queryInterface.addColumn('Orden', 'estado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pendiente',
    });

    // Luego eliminar la columna "estadoOrdenId" y su constraint
    await queryInterface.removeConstraint('Orden', 'fk_orden_estadoorden');
    await queryInterface.removeColumn('Orden', 'estadoOrdenId');
  },
};
