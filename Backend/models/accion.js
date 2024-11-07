// models/accion.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Accion extends Model {
    static associate(models) {
      Accion.belongsTo(models.Permiso, { foreignKey: 'id_permiso' });
    }
  }

  Accion.init(
    {
      id_accion: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombreAccion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_permiso: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Accion',
      tableName: 'Accion',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Accion;
};