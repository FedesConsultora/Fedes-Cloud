'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const estados = [
      { nombre: 'Pendiente' },
      { nombre: 'Pagado' },
      { nombre: 'Completado' },
      { nombre: 'Cancelado' }
    ];
    await queryInterface.bulkInsert('EstadoOrden', estados, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('EstadoOrden', null, {});
  },
};
