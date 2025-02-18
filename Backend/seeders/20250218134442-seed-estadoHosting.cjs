'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const estados = [
      { nombre: 'Pendiente' },
      { nombre: 'Activo' },
      { nombre: 'Suspendido' },
      { nombre: 'Cancelado' }
    ];
    await queryInterface.bulkInsert('EstadoHosting', estados, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('EstadoHosting', null, {});
  },
};
