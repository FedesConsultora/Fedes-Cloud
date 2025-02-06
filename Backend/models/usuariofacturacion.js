// models/usuarioFacturacion.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UsuarioFacturacion extends Model {
    static associate(models) {
      UsuarioFacturacion.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
    }
  }

  UsuarioFacturacion.init(
    {
      id_facturacion: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      razonSocial: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      domicilio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ciudad: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provincia: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pais: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      condicionIVA: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UsuarioFacturacion',
      tableName: 'UsuarioFacturacion',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return UsuarioFacturacion;
};
