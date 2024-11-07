// models/estado.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Estado extends Model {
    static associate(models) {
      Estado.hasMany(models.Usuario, { foreignKey: 'id_estado' });
    }
  }

  Estado.init(
    {
      id_estado: {
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
      modelName: 'Estado',
      tableName: 'Estado',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Estado;
};
