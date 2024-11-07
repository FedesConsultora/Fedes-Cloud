'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Accion', {
      id_accion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      nombreAccion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_permiso: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Permiso',
          key: 'id_permiso',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      // Campos de marca de tiempo
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

    // Añadir índice
    await queryInterface.addIndex('Accion', ['id_permiso'], { name: 'accion_id_permiso_index' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Accion');
  },
};