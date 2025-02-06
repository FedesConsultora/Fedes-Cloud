'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Quitar campos de dirección del modelo UsuarioContacto
    await queryInterface.removeColumn('UsuarioContacto', 'address1');
    await queryInterface.removeColumn('UsuarioContacto', 'address2');
    await queryInterface.removeColumn('UsuarioContacto', 'city');
    await queryInterface.removeColumn('UsuarioContacto', 'state');
    await queryInterface.removeColumn('UsuarioContacto', 'postalCode');
    await queryInterface.removeColumn('UsuarioContacto', 'country');
  },

  down: async (queryInterface, Sequelize) => {
    // Agregar de vuelta los campos (con configuraciones mínimas)
    await queryInterface.addColumn('UsuarioContacto', 'address1', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('UsuarioContacto', 'address2', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('UsuarioContacto', 'city', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('UsuarioContacto', 'state', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('UsuarioContacto', 'postalCode', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('UsuarioContacto', 'country', {
      type: Sequelize.STRING(2),
      allowNull: false,
      defaultValue: 'US',
    });
  }
};
