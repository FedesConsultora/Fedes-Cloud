import { Model } from 'sequelize';


export default (sequelize, DataTypes) => {
    class DNSRegistro extends Model {
      static associate(models) {
        DNSRegistro.belongsTo(models.DNS, { foreignKey: 'id_dns' });
      }
    }
  
    DNSRegistro.init(
      {
        id_registro: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER.UNSIGNED,
        },
        id_dns: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        tipo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        nombre: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        valor: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        ttl: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'DNSRegistro',
        tableName: 'DNSRegistro',
        timestamps: true,
      }
    );
  
    return DNSRegistro;
  };
  