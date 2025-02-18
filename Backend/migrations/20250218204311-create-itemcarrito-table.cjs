'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ItemCarrito', {
      id_item: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_carrito: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tipoProducto: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ej: DOMINIO, SSL, HOSTING, ADICIONAL',
      },
      productoId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID del producto, si aplica',
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
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
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

    // Clave foránea: id_carrito -> Carrito
    await queryInterface.addConstraint('ItemCarrito', {
      fields: ['id_carrito'],
      type: 'foreign key',
      name: 'fk_itemcarrito_carrito',
      references: {
        table: 'Carrito',
        field: 'id_carrito',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ItemCarrito');
  },
};
