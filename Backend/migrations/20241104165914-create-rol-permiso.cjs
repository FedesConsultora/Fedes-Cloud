'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RolPermiso', {
      id_permiso: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
          model: 'Permiso',
          key: 'id_permiso',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_rol: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
          model: 'Rol',
          key: 'id_rol',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fechaAsignacion: {
        type: Sequelize.DATE,
        allowNull: false,
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

    // Añadir índices
    await queryInterface.addIndex('RolPermiso', ['id_rol'], { name: 'rolpermiso_id_rol_index' });
    await queryInterface.addIndex('RolPermiso', ['fechaAsignacion'], { name: 'rolpermiso_fechaasignacion_index' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RolPermiso');
  },
};