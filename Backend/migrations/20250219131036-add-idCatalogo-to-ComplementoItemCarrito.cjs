'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Agregar la columna id_catalogo con FK a CatalogoComplementos
    await queryInterface.addColumn('ComplementoItemCarrito', 'id_catalogo', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'CatalogoComplementos',
        key: 'id_catalogo',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // 2) Crear el índice único para evitar duplicados
    await queryInterface.addConstraint('ComplementoItemCarrito', {
      fields: ['id_item_carrito', 'id_catalogo'],
      type: 'unique',
      name: 'uix_complementoItemCarrito_item_catalogo', // nombre del índice
    });
  },

  async down(queryInterface, Sequelize) {
    // 1) Quitar la constraint
    await queryInterface.removeConstraint(
      'ComplementoItemCarrito',
      'uix_complementoItemCarrito_item_catalogo'
    );

    // 2) Quitar la columna
    await queryInterface.removeColumn('ComplementoItemCarrito', 'id_catalogo');
  },
};
