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
      // (Opcional pero recomendado) Asociación con CatalogoComplementos
      ComplementoItemCarrito.belongsTo(models.CatalogoComplementos, {
        foreignKey: 'id_catalogo',
        as: 'catalogo',
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
      // NUEVA COLUMNA: FK al modelo CatalogoComplementos
      id_catalogo: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tipoComplemento: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcionComplemento: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ComplementoItemCarrito',
      tableName: 'ComplementoItemCarrito',
      timestamps: true,
      // ÍNDICE ÚNICO: para no permitir duplicar el mismo complemento en el mismo ítem
      indexes: [
        {
          unique: true,
          fields: ['id_item_carrito', 'id_catalogo'],
        },
      ],
    }
  );

  return ComplementoItemCarrito;
};
