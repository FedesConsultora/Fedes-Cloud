'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CatalogoComplementos', {
      id_catalogo: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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
        comment: 'Categoría del addon (ej: dominio, hosting, hosting-backup)',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CatalogoComplementos');
  },
};
