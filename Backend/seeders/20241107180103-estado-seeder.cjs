// seeders/XXXXXXXXXXXXXX-estado-seeder.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Estado', [
      {
        nombre: 'Activo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Inactivo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Estado', null, {});
  }
};
