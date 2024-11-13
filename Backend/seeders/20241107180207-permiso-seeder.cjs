// seeders/XXXXXXXXXXXXXX-permiso-seeder.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permiso', [
      // Permisos para gestionar usuarios
      {
        nombre: 'manage_users',
        descripcion: 'Permiso para gestionar usuarios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Permisos para gestionar roles
      {
        nombre: 'manage_roles',
        descripcion: 'Permiso para gestionar roles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Permisos para gestionar permisos
      {
        nombre: 'manage_permissions',
        descripcion: 'Permiso para gestionar permisos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Permisos para gestionar acciones
      {
        nombre: 'manage_actions',
        descripcion: 'Permiso para gestionar acciones',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Permiso para gestionar autenticaciones
      {
        nombre: 'manage_authentications',
        descripcion: 'Permiso para gestionar métodos de autenticación',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Permisos para gestionar 2FA
      {
        nombre: 'manage_two_factor_auth',
        descripcion: 'Permiso para gestionar la autenticación de dos factores',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Añade más permisos según sea necesario
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permiso', null, {});
  }
};
