
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    await queryInterface.bulkInsert('Permiso', [
      
      // Nuevos permisos para actualizar datos de contacto y facturación
      {
        nombre: 'update_contact_details',
        descripcion: 'Permite actualizar los datos de contacto del usuario',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'update_billing_details',
        descripcion: 'Permite actualizar los datos de facturación del usuario',
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permiso', {
      nombre: [
   
        'update_contact_details',
        'update_billing_details',
      ]
    });
  }
};
