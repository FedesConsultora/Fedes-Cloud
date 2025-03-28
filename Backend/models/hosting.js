// models/hosting.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Hosting extends Model {
    static associate(models) {
      // Cada Hosting pertenece a un Usuario
      Hosting.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });

      // Opcional: Si el Hosting se adquirió mediante una Orden
      Hosting.belongsTo(models.Orden, {
        foreignKey: 'id_orden',
        as: 'orden',
      });

      // Relación: Hosting se asocia con un EstadoHosting
      Hosting.belongsTo(models.EstadoHosting, {
        foreignKey: 'estadoHostingId',
        as: 'estadoHosting',
      });
    }
  }

  Hosting.init(
    {
      id_hosting: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_orden: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      tipoHosting: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Ej: web, wordpress, cloud',
      },
      planName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      planDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Información adicional del plan, en formato JSON',
      },
      dominio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      externalReference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      controlPanelUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      usuarioControlPanel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passwordControlPanel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fechaInicio: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fechaExpiracion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // El campo 'estadoHostingId' se agregará mediante migración.
    },
    {
      sequelize,
      modelName: 'Hosting',
      tableName: 'Hosting',
      timestamps: true,
    }
  );

  return Hosting;
};
