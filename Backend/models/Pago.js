// models/pago.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Pago extends Model {
    static associate(models) {
      // Relación: Pago -> Orden
      Pago.belongsTo(models.Orden, {
        foreignKey: 'id_orden',
        as: 'orden',
      });

      // Relación: Pago -> Usuario (quien pagó), opcional
      Pago.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });
    }
  }

  Pago.init(
    {
      id_pago: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_orden: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      estadoPago: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente', // pendiente, aprobado, fallido, etc.
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      moneda: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD',
      },
      metodoPago: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaccionId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID devuelto por la pasarela de pago',
      },
      fechaPago: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Pago',
      tableName: 'Pago',
      timestamps: true,
    }
  );

  return Pago;
};
