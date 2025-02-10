// models/usuariopadrehijo.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UsuarioPadreHijo extends Model {
    static associate(models) {
      // Cada registro pertenece a un usuario padre
      UsuarioPadreHijo.belongsTo(models.Usuario, {
        foreignKey: 'id_padre',
        as: 'padre',
      });
      // Cada registro pertenece a un usuario hijo
      UsuarioPadreHijo.belongsTo(models.Usuario, {
        foreignKey: 'id_hijo',
        as: 'hijo',
      });
    }
  }

  UsuarioPadreHijo.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_padre: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_hijo: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      subRol: {
        type: DataTypes.ENUM('No configurado', 'Administrador', 'Facturación', 'Registrante', 'Técnico'),
        allowNull: false,
        defaultValue: 'No configurado',
      },
      permitirSoporte: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accepted: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      estado_invitacion: {
        type: DataTypes.ENUM('Pendiente', 'Aceptada', 'Rechazada'),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
    },
    {
      sequelize,
      modelName: 'UsuarioPadreHijo',
      tableName: 'UsuarioPadreHijo',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return UsuarioPadreHijo;
};
