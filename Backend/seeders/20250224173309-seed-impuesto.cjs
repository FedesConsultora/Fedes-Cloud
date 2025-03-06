'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Impuesto', [{
      nombre: 'IVA',
      porcentaje: 21.00,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Impuesto', { nombre: 'IVA' }, {});
  }
};