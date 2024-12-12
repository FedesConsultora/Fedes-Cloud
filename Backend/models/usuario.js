// models/usuario.js

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Estado, { foreignKey: 'id_estado' });
      Usuario.belongsTo(models.Rol, { foreignKey: 'id_rol' });
      Usuario.belongsTo(models.Autenticacion, { foreignKey: 'id_autenticacion' });
    }
  }

  Usuario.init(
    {
      id_usuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
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
      password: {
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
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailTokenExpires: { 
        type: DataTypes.DATE,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      twoFactorSecret: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      twoFactorTempToken: { 
        type: DataTypes.STRING,
        allowNull: true,
      },
      twoFactorTempExpires: {
        type: DataTypes.DATE,
        allowNull: true,
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
