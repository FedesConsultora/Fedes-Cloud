// models/ordenDetalle.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrdenDetalle extends Model {
    static associate(models) {
      // Relación: OrdenDetalle -> Orden
      OrdenDetalle.belongsTo(models.Orden, {
        foreignKey: 'id_orden',
        as: 'orden',
      });

      // Relación: OrdenDetalle -> Usuario (asignado) para servicios manuales
      OrdenDetalle.belongsTo(models.Usuario, {
        foreignKey: 'id_asignado',
        as: 'asignado',
      });

      // Relación: OrdenDetalle -> OrdenDetalleHistorial (1 - muchos)
      OrdenDetalle.hasMany(models.OrdenDetalleHistorial, {
        foreignKey: 'id_detalle',
        as: 'historial',
      });
    }
  }

  OrdenDetalle.init(
    {
      id_detalle: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id_orden: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      id_asignado: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      tipoProducto: {
        type: DataTypes.STRING,
        allowNull: false, // 'DOMINIO', 'SSL', 'HOSTING', etc.
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Breve descripción (ej: "example.com", "Plan Hosting X")',
      },
      id_referencia: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'ID de la tabla concreta (Dominios, Certificado) si aplica',
      },
      cantidad: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      estadoManual: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Abierto', // 'Abierto','Asignado','En Progreso','Finalizado','Cancelado'
      },
      tiempoEstimadoHoras: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      fechaEstimadaFin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fechaInicioTrabajo: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fechaFinTrabajo: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      prioridad: {
        type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
        defaultValue: 'media',
      },
      metaDatos: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Campo libre para almacenar configuración adicional',
      },
    },
    {
      sequelize,
      modelName: 'OrdenDetalle',
      tableName: 'OrdenDetalle',
      timestamps: true,
    }
  );

  return OrdenDetalle;
};
