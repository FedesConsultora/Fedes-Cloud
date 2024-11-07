// models/rolPermiso.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RolPermiso extends Model {
    static associate(models) {
      // Las asociaciones se manejan en los modelos Rol y Permiso
    }
  }

  RolPermiso.init(
    {
      id_permiso: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
      id_rol: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
      fechaAsignacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'RolPermiso',
      tableName: 'RolPermiso',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return RolPermiso;
};
