'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const catalogo = [
      // Complementos para dominios
      {
        tipoComplemento: 'Privacidad de dominio',
        descripcionComplemento: 'Tu información personal en Internet estará protegida. Más info',
        precio: 2250,
        categoria: 'dominio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoComplemento: 'Seguridad premium',
        descripcionComplemento: 'Protege tu dominio contra malware y piratería. Más info',
        precio: 1689,
        categoria: 'dominio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Complementos para hosting
      {
        tipoComplemento: 'Cloudflare - Mantenimiento Premium',
        descripcionComplemento: 'Instalamos y mantenemos Cloudflare en tu hosting. Más info',
        precio: 1599,
        categoria: 'hosting',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoComplemento: 'WordPress Stage',
        descripcionComplemento: '¡Descubre fallas en tu sitio antes que tus clientes!',
        precio: 1599,
        categoria: 'hosting',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Complementos para backup en hosting (diferentes opciones)
      {
        tipoComplemento: 'Backup diario',
        descripcionComplemento: 'Backup diario de 5GB para tu sitio web.',
        precio: 999,
        categoria: 'hosting-backup',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoComplemento: 'Backup diario',
        descripcionComplemento: 'Backup diario de 25GB para tu sitio web.',
        precio: 1499,
        categoria: 'hosting-backup',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoComplemento: 'Backup diario',
        descripcionComplemento: 'Backup diario de 100GB para tu sitio web.',
        precio: 5999,
        categoria: 'hosting-backup',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoComplemento: 'Backup diario',
        descripcionComplemento: 'Backup diario de 200GB para tu sitio web.',
        precio: 6899,
        categoria: 'hosting-backup',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipoComplemento: 'Backup diario',
        descripcionComplemento: 'Backup diario de 300GB para tu sitio web.',
        precio: 7299,
        categoria: 'hosting-backup',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('CatalogoComplementos', catalogo, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CatalogoComplementos', null, {});
  },
};
