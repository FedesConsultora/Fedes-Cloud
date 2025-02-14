module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrdenDetalle', {
      id_detalle: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_orden: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_asignado: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      tipoProducto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cantidad: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      estadoManual: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Abierto',
      },
      tiempoEstimadoHoras: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      fechaEstimadaFin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fechaInicioTrabajo: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fechaFinTrabajo: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'urgente'),
        defaultValue: 'media',
      },
      metaDatos: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Foreign key a la tabla 'Orden'
    await queryInterface.addConstraint('OrdenDetalle', {
      fields: ['id_orden'],
      type: 'foreign key',
      name: 'fk_orden_detalle_orden',
      references: {
        table: 'Orden',
        field: 'id_orden',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Si quieres la fk para id_asignado -> Usuario
    await queryInterface.addConstraint('OrdenDetalle', {
      fields: ['id_asignado'],
      type: 'foreign key',
      name: 'fk_orden_detalle_asignado',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Quita la tabla
    await queryInterface.dropTable('OrdenDetalle');
  },
};
