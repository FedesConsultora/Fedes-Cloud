'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Hosting', {
      id_hosting: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_orden: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      tipoHosting: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ej: web, wordpress, cloud',
      },
      planName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      planDetails: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Información adicional del plan, en formato JSON',
      },
      dominio: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      externalReference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      controlPanelUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      usuarioControlPanel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      passwordControlPanel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Columna para referenciar EstadoHosting
      estadoHostingId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1, // Suponiendo que "Pendiente" tiene id 1
        comment: 'Referencia al estado del hosting en la tabla EstadoHosting',
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

    // Restricción de clave foránea para id_usuario (cambiamos el nombre)
    await queryInterface.addConstraint('Hosting', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_hosting_usuario_new', // Nombre modificado para evitar duplicados
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Restricción de clave foránea para id_orden (opcional)
    await queryInterface.addConstraint('Hosting', {
      fields: ['id_orden'],
      type: 'foreign key',
      name: 'fk_hosting_orden',
      references: {
        table: 'Orden',
        field: 'id_orden',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Restricción de clave foránea para estadoHostingId
    await queryInterface.addConstraint('Hosting', {
      fields: ['estadoHostingId'],
      type: 'foreign key',
      name: 'fk_hosting_estadoHosting',
      references: {
        table: 'EstadoHosting',
        field: 'id_estado_hosting',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Hosting');
  },
};
