// models/usuarioContacto.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UsuarioContacto extends Model {
    static associate(models) {
      // Asociación con el modelo Usuario
      UsuarioContacto.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
    }
  }

  UsuarioContacto.init(
    {
      id_contacto: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tipo_contacto: {
        type: DataTypes.ENUM(
          'No configurado',
          'Administrador',
          'Facturación',
          'Registrante',
          'Técnico'
        ),
        allowNull: false,
        defaultValue: 'No configurado'
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fax: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'UsuarioContacto',
      tableName: 'UsuarioContacto',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return UsuarioContacto;
};
