// models/itemCarrito.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ItemCarrito extends Model {
    static associate(models) {
      // Cada item pertenece a un carrito
      ItemCarrito.belongsTo(models.Carrito, {
        foreignKey: 'id_carrito',
        as: 'carrito',
      });
      // Un item puede tener muchos complementos
      ItemCarrito.hasMany(models.ComplementoItemCarrito, {
        foreignKey: 'id_item_carrito',
        as: 'complementos',
      });
    }
  }

  ItemCarrito.init(
    {
      id_item: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      id_carrito: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tipoProducto: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Ej: DOMINIO, SSL, HOSTING, ADICIONAL',
      },
      productoId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID del producto, si aplica',
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'ItemCarrito',
      tableName: 'ItemCarrito',
      timestamps: true,
    }
  );

  return ItemCarrito;
};
