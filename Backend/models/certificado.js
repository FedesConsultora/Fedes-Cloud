import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Certificado extends Model {
    static associate(models) {
      // Un Certificado pertenece a un Servicio
      Certificado.belongsTo(models.Servicio, { foreignKey: 'id_servicio' });
    }
  }

  Certificado.init(
    {
      id_certificado: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_servicio: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      // ID externo que devuelve GoDaddy al crear el certificado (certificateId)
      goDaddyCertificateId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID del certificado en GoDaddy',
      },

      // Ej: 'DV_SSL', 'OV_SSL', 'EV_SSL', etc. (renombra "tipoCertificado" a "productType")
      productType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'DV_SSL',
        comment: 'Tipo de certificado en la API (DV_SSL, OV_SSL, EV_SSL, etc.)',
      },

      // Dominio principal (commonName) para la API
      commonName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Array de SAN en formato JSON
      subjectAlternativeNames: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Lista de SAN (subject alt names)',
      },

      // Número de años (1,2,3,5)
      period: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Periodo en años',
      },

      // CSR (si el usuario gestiona sus llaves externamente)
      csr: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Cadena CSR enviada a la API de certificados',
      },

      // Estado local del certificado: 'Pendiente', 'Emitido', 'Revocado', etc.
      estadoCertificado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pendiente',
      },

      // Fechas de emisión/expiración (podrían ser null mientras esté pendiente)
      fechaEmision: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fechaExpiracion: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // URL para WebHook (callback) si usas notificaciones en lugar de polling
      callbackUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Certificado',
      tableName: 'Certificado',
      timestamps: true,
    }
  );

  return Certificado;
};
