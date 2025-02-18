// models/orden.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Orden extends Model {
    static associate(models) {
      // Relación: Orden -> Usuario (quien realiza la orden)
      Orden.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });

      // Relación: Orden -> OrdenDetalle (1 - muchos)
      Orden.hasMany(models.OrdenDetalle, {
        foreignKey: 'id_orden',
        as: 'detalles',
      });

      // Relación: Orden -> Pago (1 - muchos) (opcional)
      Orden.hasMany(models.Pago, {
        foreignKey: 'id_orden',
        as: 'pagos',
      });

      // Nueva relación: Orden -> EstadoOrden
      Orden.belongsTo(models.EstadoOrden, {
        foreignKey: 'estadoOrdenId',
        as: 'estadoOrden',
      });
    }
  }

  Orden.init(
    {
      id_orden: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      
      montoTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      moneda: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ARS',
      },
      metodoPago: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Ej: stripe, paypal, etc.',
      },
      referenciaPago: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de la transacción en la pasarela de pago',
      },
    },
    {
      sequelize,
      modelName: 'Orden',
      tableName: 'Orden',
      timestamps: true,
    }
  );

  return Orden;
};
