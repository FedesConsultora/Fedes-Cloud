'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    await queryInterface.bulkInsert('Permiso', [
      {
        nombre: 'check_domain_availability',
        descripcion: 'Permite verificar la disponibilidad de un dominio GoDaddy',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'suggest_domains',
        descripcion: 'Permite sugerir dominios basados en una keyword (GoDaddy)',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'register_domain',
        descripcion: 'Permite registrar un dominio en GoDaddy',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'renew_domain',
        descripcion: 'Permite renovar un dominio GoDaddy',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'manage_dns_records',
        descripcion: 'Permite crear/editar/borrar registros DNS',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'view_dns_records',
        descripcion: 'Permite ver registros DNS',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'install_ssl_cert',
        descripcion: 'Permite instalar un certificado SSL',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'renew_ssl_cert',
        descripcion: 'Permite renovar un certificado SSL',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: 'revoke_ssl_cert',
        descripcion: 'Permite revocar un certificado SSL',
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Al hacer rollback, borraremos estos permisos
    await queryInterface.bulkDelete('Permiso', {
      nombre: [
        'check_domain_availability',
        'suggest_domains',
        'register_domain',
        'renew_domain',
        'manage_dns_records',
        'view_dns_records',
        'install_ssl_cert',
        'renew_ssl_cert',
        'revoke_ssl_cert',
      ]
    });
  }
};
