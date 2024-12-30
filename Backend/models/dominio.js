import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Dominio extends Model {
      static associate(models) {
        Dominio.belongsTo(models.Servicio, { foreignKey: 'id_servicio' });
      }
    }
  
    Dominio.init(
      {
        id_dominio: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER.UNSIGNED,
        },
        id_servicio: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        nombreDominio: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fechaExpiracion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        bloqueado: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        proteccionPrivacidad: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Dominio',
        tableName: 'Dominio',
        timestamps: true,
      }
    );
  
    return Dominio;
  };
  