// models/impuesto.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Impuesto extends Model {
    static associate(models) {
      // Puedes definir asociaciones si es necesario, por ejemplo con Orden.
    }
  }

  Impuesto.init(
    {
      id_impuesto: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del impuesto, por ejemplo: IVA',
      },
      porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Porcentaje de impuesto. Ej: 21.00 para 21%',
      },
    },
    {
      sequelize,
      modelName: 'Impuesto',
      tableName: 'Impuesto',
      timestamps: true,
    }
  );

  return Impuesto;
};
