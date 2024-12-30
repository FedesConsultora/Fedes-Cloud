'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Certificado', {
      id_certificado: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      id_servicio: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Servicio', // Hace referencia a la tabla Servicio
          key: 'id_servicio',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipoCertificado: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fechaEmision: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      estadoCertificado: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('Certificado');
  },
};
