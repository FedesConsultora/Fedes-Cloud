// models/autenticacion.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Autenticacion extends Model {
    static associate(models) {
      Autenticacion.hasMany(models.Usuario, { foreignKey: 'id_autenticacion' });
    }
  }

  Autenticacion.init(
    {
      id_autenticacion: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      tipoAutenticacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Autenticacion',
      tableName: 'Autenticacion',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Autenticacion;
};
