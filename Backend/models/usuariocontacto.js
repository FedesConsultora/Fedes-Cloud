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
        references: {
          model: 'Usuario', // Asegúrate de que el nombre de la tabla coincide
          key: 'id_usuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo_contacto: {
        type: DataTypes.ENUM('Admin', 'Billing', 'Registrant', 'Tech'),
        allowNull: false,
      },
      address1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: 'US',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fax: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nameFirst: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nameMiddle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nameLast: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: { // Timestamps
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
