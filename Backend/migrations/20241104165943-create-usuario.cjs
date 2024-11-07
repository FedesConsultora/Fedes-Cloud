'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuario', {
      id_usuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      contraseña: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fechaNacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      ultimaActividad: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      preferenciasNotificaciones: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      id_estado: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_rol: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Rol',
          key: 'id_rol',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_autenticacion: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Autenticacion',
          key: 'id_autenticacion',
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

    // Añadir índices
    await queryInterface.addIndex('Usuario', ['id_estado'], { name: 'usuario_id_estado_index' });
    await queryInterface.addIndex('Usuario', ['id_rol'], { name: 'usuario_id_rol_index' });
    await queryInterface.addIndex('Usuario', ['id_autenticacion'], { name: 'usuario_id_autenticacion_index' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuario');
  },
};