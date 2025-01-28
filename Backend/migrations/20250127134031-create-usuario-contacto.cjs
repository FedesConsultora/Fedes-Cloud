// migrations/XXXXXXXXXXXXXX-create-usuario-contacto.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UsuarioContacto', {
      id_contacto: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo_contacto: {
        type: Sequelize.ENUM('Admin', 'Billing', 'Registrant', 'Tech'),
        allowNull: false,
      },
      address1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: false,
        defaultValue: 'US',
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fax: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nameFirst: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nameMiddle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nameLast: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: { // Timestamps
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

    // Crear índice único en id_usuario y tipo_contacto
    await queryInterface.addConstraint('UsuarioContacto', {
      fields: ['id_usuario', 'tipo_contacto'],
      type: 'unique',
      name: 'unique_usuario_contacto_tipo',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UsuarioContacto');
  },
};
