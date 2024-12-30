import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Certificado extends Model {
      static associate(models) {
        Certificado.belongsTo(models.Servicio, { foreignKey: 'id_servicio' });
      }
    }
  
    Certificado.init(
      {
        id_certificado: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER.UNSIGNED,
        },
        id_servicio: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        tipoCertificado: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fechaEmision: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        fechaExpiracion: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        estadoCertificado: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Certificado',
        tableName: 'Certificado',
        timestamps: true,
      }
    );
  
    return Certificado;
  };
  