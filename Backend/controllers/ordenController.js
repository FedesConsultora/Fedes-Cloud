import { Orden, OrdenDetalle } from '../models/index.js';
import logger from '../utils/logger.js';
import { ValidationError, PermissionDeniedError } from '../utils/errors/GeneralErrors.js';
import { Sequelize } from 'sequelize'; // IMPORTANTE si usarás funciones de agregación

/**
 * Crear una nueva Orden
 */
export const createOrden = async (req, res, next) => {
  try {
    const { detalles, metodoPago } = req.body;

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      throw new ValidationError('Debe proveer al menos un detalle en la orden.');
    }

    const nuevaOrden = await Orden.create({
      id_usuario: req.user.id_usuario,
      estado: 'pendiente',
      metodoPago: metodoPago || null,
    });

    let total = 0;

    // Insertar detalles
    for (const det of detalles) {
      const { tipoProducto, descripcion, cantidad, precioUnitario } = det;
      const createdDetalle = await OrdenDetalle.create({
        id_orden: nuevaOrden.id_orden,
        tipoProducto,
        descripcion,
        cantidad: cantidad || 1,
        precioUnitario: precioUnitario || 0,
      });
      const subtotal = parseFloat(createdDetalle.cantidad) * parseFloat(createdDetalle.precioUnitario);
      await createdDetalle.update({ subtotal });
      total += subtotal;
    }

    // Actualizar el montoTotal de la orden
    await nuevaOrden.update({ montoTotal: total });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: nuevaOrden,
    });
  } catch (error) {
    logger.error(`Error al crear orden: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener todas las órdenes del usuario autenticado
 */
export const getOrdenesByUser = async (req, res, next) => {
  try {
    const id_usuario = req.user.id_usuario;
    const ordenes = await Orden.findAll({
      where: { id_usuario },
      include: [{ model: OrdenDetalle, as: 'detalles' }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, data: ordenes });
  } catch (error) {
    logger.error(`Error al obtener órdenes: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener una sola orden por ID (asegurando que pertenece al usuario autenticado)
 */
export const getOrdenById = async (req, res, next) => {
  try {
    const { id_orden } = req.params;
    const orden = await Orden.findOne({
      where: { id_orden, id_usuario: req.user.id_usuario },
      include: [{ model: OrdenDetalle, as: 'detalles' }],
    });
    if (!orden) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    res.status(200).json({ success: true, data: orden });
  } catch (error) {
    logger.error(`Error al obtener orden: ${error.message}`);
    next(error);
  }
};

/**
 * Cancelar la orden
 */
export const cancelOrden = async (req, res, next) => {
  try {
    const { id_orden } = req.params;
    const orden = await Orden.findOne({
      where: { id_orden, id_usuario: req.user.id_usuario },
    });
    if (!orden) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    if (orden.estado === 'pagado') {
      return res
        .status(400)
        .json({ success: false, message: 'No se puede cancelar una orden ya pagada' });
    }
    await orden.update({ estado: 'cancelado' });
    res.status(200).json({ success: true, message: 'Orden cancelada exitosamente.' });
  } catch (error) {
    logger.error(`Error al cancelar orden: ${error.message}`);
    next(error);
  }
};

/**
 * Completar la orden (forzar estado "completado")
 */
export const completeOrden = async (req, res, next) => {
  try {
    const { id_orden } = req.params;
    const orden = await Orden.findOne({
      where: { id_orden, id_usuario: req.user.id_usuario },
      include: [{ model: OrdenDetalle, as: 'detalles' }],
    });
    if (!orden) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    // Puedes verificar si todos los detalles están "Finalizado"
    // o tu propia lógica...
    await orden.update({ estado: 'completado' });
    res.status(200).json({ success: true, message: 'Orden marcada como completada.' });
  } catch (error) {
    logger.error(`Error al completar orden: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un resumen de cuántas órdenes hay en cada estado.
 * Solo se debería permitir a roles "admin" o similares.
 */
export const summaryByStatus = async (req, res, next) => {
  try {
    // Verifica rol "admin" (o como manejes roles en tu proyecto)
    if (req.user.rol !== 'admin') {
      throw new PermissionDeniedError('No tienes permisos de administrador.');
    }

    // Consulta de agrupación
    // Nota: Debes importar { Sequelize } arriba => import { Sequelize } from 'sequelize';
    const rawSummary = await Orden.findAll({
      attributes: [
        'estado',
        [Sequelize.fn('COUNT', Sequelize.col('estado')), 'count']
      ],
      group: ['estado'],
    });

    // Estructura la respuesta en un objeto { estado: count }
    const summary = {};
    rawSummary.forEach(row => {
      summary[row.estado] = parseInt(row.getDataValue('count'), 10);
    });

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    logger.error(`Error al obtener summary de órdenes: ${error.message}`);
    next(error);
  }
};

/**
 * Listar todas las órdenes de todos los usuarios (solo admin).
 */
export const listAllOrdenes = async (req, res, next) => {
  try {
    // Verifica rol "admin"
    if (req.user.rol !== 'admin') {
      throw new PermissionDeniedError('No tienes permisos de administrador.');
    }

    const allOrdenes = await Orden.findAll({
      include: [{ model: OrdenDetalle, as: 'detalles' }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, data: allOrdenes });
  } catch (error) {
    logger.error(`Error al listar todas las órdenes: ${error.message}`);
    next(error);
  }
};