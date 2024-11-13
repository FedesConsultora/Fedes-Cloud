// seeders/XXXXXXXXXXXXXX-rol-seeder.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Rol', [
      {
        nombre: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Interno',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Externo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Rol', null, {});
  }
};
