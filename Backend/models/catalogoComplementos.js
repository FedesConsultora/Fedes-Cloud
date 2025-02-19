// models/catalogoComplementos.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CatalogoComplementos extends Model {}
  CatalogoComplementos.init(
    {
      id_catalogo: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
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
        comment: 'Categoría del addon (ej: dominio, hosting, hosting-backup)',
      },
    },
    {
      sequelize,
      modelName: 'CatalogoComplementos',
      tableName: 'CatalogoComplementos',
      timestamps: true,
    }
  );
  return CatalogoComplementos;
};
