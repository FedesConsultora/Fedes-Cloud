// models/carrito.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Carrito extends Model {
    static associate(models) {
      // Cada carrito pertenece a un Usuario
      Carrito.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });
      // Un carrito tiene muchos items
      Carrito.hasMany(models.ItemCarrito, {
        foreignKey: 'id_carrito',
        as: 'items',
      });
    }
  }

  Carrito.init(
    {
      id_carrito: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activo', // activo, procesando, finalizado, cancelado
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Carrito',
      tableName: 'Carrito',
      timestamps: true,
    }
  );

  return Carrito;
};
