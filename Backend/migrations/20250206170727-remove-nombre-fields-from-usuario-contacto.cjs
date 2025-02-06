'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar los campos nameFirst, nameMiddle y nameLast de la tabla UsuarioContacto
    await queryInterface.removeColumn('UsuarioContacto', 'nameFirst');
    await queryInterface.removeColumn('UsuarioContacto', 'nameMiddle');
    await queryInterface.removeColumn('UsuarioContacto', 'nameLast');
  },

  down: async (queryInterface, Sequelize) => {
    // En caso de hacer rollback, se vuelven a agregar los campos
    await queryInterface.addColumn('UsuarioContacto', 'nameFirst', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('UsuarioContacto', 'nameMiddle', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('UsuarioContacto', 'nameLast', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
