// models/permiso.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Permiso extends Model {
    static associate(models) {
      Permiso.belongsToMany(models.Rol, {
        through: models.RolPermiso,
        foreignKey: 'id_permiso',
        otherKey: 'id_rol',
      });
      Permiso.hasMany(models.Accion, { foreignKey: 'id_permiso' });
    }
  }

  Permiso.init(
    {
      id_permiso: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Permiso',
      tableName: 'Permiso',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Permiso;
};