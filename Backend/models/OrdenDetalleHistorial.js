// models/ordenDetalleHistorial.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrdenDetalleHistorial extends Model {
    static associate(models) {
      // Relación: Historial -> OrdenDetalle
      OrdenDetalleHistorial.belongsTo(models.OrdenDetalle, {
        foreignKey: 'id_detalle',
        as: 'detalle',
      });

      // Relación: Historial -> Usuario (autor del cambio)
      OrdenDetalleHistorial.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'autor',
      });
    }
  }

  OrdenDetalleHistorial.init(
    {
      id_historial: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_detalle: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      estadoAnterior: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estadoNuevo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      fechaCambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'OrdenDetalleHistorial',
      tableName: 'OrdenDetalleHistorial',
      timestamps: false, // si no deseas updatedAt, createdAt automáticos
    }
  );

  return OrdenDetalleHistorial;
};
