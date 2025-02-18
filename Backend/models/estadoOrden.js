// models/estadoOrden.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class EstadoOrden extends Model {
    static associate(models) {
        
        EstadoOrden.hasMany(models.Orden, { foreignKey: 'estadoOrdenId', as: 'ordenes' });
    }
  }

  EstadoOrden.init(
    {
      id_estado_orden: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del estado (ej: "Pendiente", "Pagado", "Completado", "Cancelado")',
      },
    },
    {
      sequelize,
      modelName: 'EstadoOrden',
      tableName: 'EstadoOrden',
      timestamps: false, // No es necesario tener createdAt/updatedAt
    }
  );

  return EstadoOrden;
};
