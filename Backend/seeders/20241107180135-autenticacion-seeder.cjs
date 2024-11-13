// seeders/XXXXXXXXXXXXXX-autenticacion-seeder.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Autenticacion', [
      {
        tipoAutenticacion: 'Local',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoAutenticacion: 'Google (Auth0)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoAutenticacion: 'Facebook',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoAutenticacion: 'Two-Factor Authentication (2FA)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Puedes añadir más métodos de autenticación si lo deseas
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Autenticacion', null, {});
  }
};
