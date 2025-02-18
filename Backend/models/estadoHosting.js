// models/estadoHosting.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class EstadoHosting extends Model {
    static associate(models) {
      // Cada EstadoHosting puede tener muchos Hostings asociados.
      EstadoHosting.hasMany(models.Hosting, {
        foreignKey: 'estadoHostingId',
        as: 'hostings',
      });
    }
  }

  EstadoHosting.init(
    {
      id_estado_hosting: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del estado (ej: "Pendiente", "Activo", "Suspendido", "Cancelado")',
      },
    },
    {
      sequelize,
      modelName: 'EstadoHosting',
      tableName: 'EstadoHosting',
      timestamps: false,
    }
  );

  return EstadoHosting;
};
