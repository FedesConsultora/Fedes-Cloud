'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permiso', [
      {
        nombre: 'manage_services',
        descripcion: 'Permiso para gestionar servicios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'view_services',
        descripcion: 'Permiso para ver servicios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'update_services',
        descripcion: 'Permiso para actualizar servicios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'delete_services',
        descripcion: 'Permiso para eliminar servicios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permiso', { 
      nombre: [
        'manage_services',
        'view_services',
        'update_services',
        'delete_services'
      ]
    });
  }
};
