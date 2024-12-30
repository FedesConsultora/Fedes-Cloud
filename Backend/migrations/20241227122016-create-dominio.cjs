'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Dominio', {
      id_dominio: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      id_servicio: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Servicio', 
          key: 'id_servicio',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nombreDominio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      bloqueado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      proteccionPrivacidad: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('Dominio');
  },
};
