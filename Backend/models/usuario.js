// models/usuario.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, { foreignKey: 'id_rol' });
      Usuario.belongsTo(models.Estado, { foreignKey: 'id_estado' });
      Usuario.belongsTo(models.Autenticacion, { foreignKey: 'id_autenticacion' });
    }
  }

  Usuario.init(
    {
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      contraseña: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      ultimaActividad: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      preferenciasNotificaciones: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      id_estado: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_rol: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_autenticacion: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'Usuario',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Usuario;
};