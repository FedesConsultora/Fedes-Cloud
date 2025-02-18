// models/complementoItemCarrito.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ComplementoItemCarrito extends Model {
    static associate(models) {
      // Cada complemento pertenece a un item del carrito
      ComplementoItemCarrito.belongsTo(models.ItemCarrito, {
        foreignKey: 'id_item_carrito',
        as: 'itemCarrito',
      });
    }
  }

  ComplementoItemCarrito.init(
    {
      id_complemento: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      id_item_carrito: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tipoComplemento: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Ej: Privacidad, Seguridad premium, Cloudflare, etc.',
      },
      descripcionComplemento: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Categoría del addon (ej: dominio, hosting, etc.)',
      },
    },
    {
      sequelize,
      modelName: 'ComplementoItemCarrito',
      tableName: 'ComplementoItemCarrito',
      timestamps: true,
    }
  );

  return ComplementoItemCarrito;
};
