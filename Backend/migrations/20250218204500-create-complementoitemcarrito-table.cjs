'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ComplementoItemCarrito', {
      id_complemento: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_item_carrito: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tipoComplemento: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ej: Privacidad, Seguridad premium, Cloudflare, etc.',
      },
      descripcionComplemento: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      precio: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Categoría del addon (ej: dominio, hosting, etc.)',
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

    // Clave foránea: id_item_carrito -> ItemCarrito
    await queryInterface.addConstraint('ComplementoItemCarrito', {
      fields: ['id_item_carrito'],
      type: 'foreign key',
      name: 'fk_complementoitemcarrito_itemcarrito',
      references: {
        table: 'ItemCarrito',
        field: 'id_item',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ComplementoItemCarrito');
  },
};
