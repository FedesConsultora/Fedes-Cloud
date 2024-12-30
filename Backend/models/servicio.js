import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Servicio extends Model {
    static associate(models) {
      // Asociaciones con otros modelos
      Servicio.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
      Servicio.hasMany(models.DNS, { foreignKey: 'id_servicio' });
      Servicio.hasMany(models.Certificado, { foreignKey: 'id_servicio' });
      Servicio.hasMany(models.Dominio, { foreignKey: 'id_servicio' });
    }
  }

  Servicio.init(
    {
      id_servicio: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Servicio',
      tableName: 'Servicio',
      timestamps: true,
    }
  );

  return Servicio;
};

