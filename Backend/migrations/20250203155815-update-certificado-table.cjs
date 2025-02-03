'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Renombrar la columna "tipoCertificado" -> "productType"
    await queryInterface.renameColumn('Certificado', 'tipoCertificado', 'productType');

    // 2) Permitir null en fechaEmision y fechaExpiracion (anteriormente allowNull = false)
    await queryInterface.changeColumn('Certificado', 'fechaEmision', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('Certificado', 'fechaExpiracion', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // 3) Cambiar defaultValue de estadoCertificado a 'Pendiente'
    await queryInterface.changeColumn('Certificado', 'estadoCertificado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pendiente',
    });

    // 4) Agregar las nuevas columnas:
    // goDaddyCertificateId (string), commonName (string), subjectAlternativeNames (JSON),
    // period (integer), csr (text), callbackUrl (string).

    await queryInterface.addColumn('Certificado', 'goDaddyCertificateId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ID del certificado en GoDaddy',
    });

    await queryInterface.addColumn('Certificado', 'commonName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Certificado', 'subjectAlternativeNames', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Lista de SAN (subject alt names)',
    });

    await queryInterface.addColumn('Certificado', 'period', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Periodo en años',
    });

    await queryInterface.addColumn('Certificado', 'csr', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Cadena CSR enviada a la API de certificados',
    });

    await queryInterface.addColumn('Certificado', 'callbackUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios en caso de rollback:

    // 1) Eliminar las columnas nuevas
    await queryInterface.removeColumn('Certificado', 'goDaddyCertificateId');
    await queryInterface.removeColumn('Certificado', 'commonName');
    await queryInterface.removeColumn('Certificado', 'subjectAlternativeNames');
    await queryInterface.removeColumn('Certificado', 'period');
    await queryInterface.removeColumn('Certificado', 'csr');
    await queryInterface.removeColumn('Certificado', 'callbackUrl');

    // 2) Revertir defaultValue de estadoCertificado
    await queryInterface.changeColumn('Certificado', 'estadoCertificado', {
      type: Sequelize.STRING,
      allowNull: false,
      // defaultValue: 'Activo' o lo que tuvieras antes (ajusta si no había default)
    });

    // 3) Volver a fechaEmision y fechaExpiracion a allowNull: false
    await queryInterface.changeColumn('Certificado', 'fechaEmision', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('Certificado', 'fechaExpiracion', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    // 4) Renombrar "productType" de regreso a "tipoCertificado"
    await queryInterface.renameColumn('Certificado', 'productType', 'tipoCertificado');
  },
};

