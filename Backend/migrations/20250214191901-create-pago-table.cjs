'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pago', {
      id_pago: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_orden: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      estadoPago: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pendiente', // pendiente, aprobado, fallido, etc.
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      moneda: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USD',
      },
      metodoPago: {
        type: Sequelize.STRING,
        allowNull: true, // stripe, paypal, etc.
      },
      transaccionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fechaPago: {
        type: Sequelize.DATE,
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

    // FK a 'Orden'
    await queryInterface.addConstraint('Pago', {
      fields: ['id_orden'],
      type: 'foreign key',
      name: 'fk_pago_orden',
      references: {
        table: 'Orden',
        field: 'id_orden',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // FK a 'Usuario' (quien pagó, opcional)
    await queryInterface.addConstraint('Pago', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_pago_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pago');
  },
};
