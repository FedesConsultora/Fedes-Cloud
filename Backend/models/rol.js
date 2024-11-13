// models/rol.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, { foreignKey: 'id_rol' });
      Rol.belongsToMany(models.Permiso, {
        through: models.RolPermiso,
        foreignKey: 'id_rol',
        otherKey: 'id_permiso',
        as: 'permisos',
      });
    }
  }

  Rol.init(
    {
      id_rol: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Rol',
      tableName: 'Rol',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Rol;
};
