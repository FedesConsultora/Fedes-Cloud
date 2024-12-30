import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class DNS extends Model {
      static associate(models) {
        DNS.belongsTo(models.Servicio, { foreignKey: 'id_servicio' });
        DNS.hasMany(models.DNSRegistro, { foreignKey: 'id_dns' });
      }
    }
  
    DNS.init(
      {
        id_dns: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER.UNSIGNED,
        },
        id_servicio: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'DNS',
        tableName: 'DNS',
        timestamps: true,
      }
    );
  
    return DNS;
  };
  