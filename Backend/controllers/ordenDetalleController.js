import { OrdenDetalle, Orden } from '../models/index.js';
import logger from '../utils/logger.js';
import { ValidationError } from '../utils/errors/GeneralErrors.js';

/**
 * Obtener un detalle por ID, asegurando que pertenece a la orden del usuario.
 */
export const getDetalleById = async (req, res, next) => {
  try {
    const { id_detalle } = req.params;

    // Para asegurar que le pertenece al usuario, primero encontraremos el detalle con su orden
    const detalle = await OrdenDetalle.findOne({
      where: { id_detalle },
      include: [{ model: Orden, as: 'orden' }],
    });
    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
    }
    if (detalle.orden.id_usuario !== req.user.id_usuario) {
      // O si tu lógica lo permite, verificar roles (admin, etc.)
      return res.status(403).json({ success: false, message: 'No tienes acceso a este detalle' });
    }
    res.status(200).json({ success: true, data: detalle });
  } catch (error) {
    logger.error(`Error al obtener detalle: ${error.message}`);
    next(error);
  }
};

/**
 * Asignar un detalle a un usuario interno (p. ej. un soporte con rol "Trabajador")
 */
export const asignarDetalle = async (req, res, next) => {
  try {
    const { id_detalle } = req.params;
    const { id_asignado } = req.body; // ID del usuario interno que tomará la tarea

    const detalle = await OrdenDetalle.findOne({
      where: { id_detalle },
      include: [{ model: Orden, as: 'orden' }],
    });
    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
    }

    // Verificar si la orden pertenece al usuario actual (o si es un admin)
    if (detalle.orden.id_usuario !== req.user.id_usuario) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a esta orden' });
    }

    await detalle.update({
      id_asignado,
      estadoManual: 'Asignado',
    });

    res.status(200).json({ success: true, message: 'Detalle asignado correctamente.' });
  } catch (error) {
    logger.error(`Error al asignar detalle: ${error.message}`);
    next(error);
  }
};

/**
 * Cambiar el estado manual del detalle
 */
export const cambiarEstadoManual = async (req, res, next) => {
    try {
      const { id_detalle } = req.params;
      const { nuevoEstado } = req.body; // 'En Progreso', 'Finalizado', etc.
  
      const detalle = await OrdenDetalle.findOne({
        where: { id_detalle },
        include: [{ model: Orden, as: 'orden' }],
      });
      if (!detalle) {
        return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
      }
      if (detalle.orden.id_usuario !== req.user.id_usuario) {
        return res.status(403).json({ success: false, message: 'No tienes acceso a esta orden' });
      }
  
      // Podrías validar que el nuevoEstado sea uno de los permitidos
      const estadosPermitidos = ['Abierto','Asignado','En Progreso','Finalizado','Cancelado'];
      if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new ValidationError(
          `Estado ${nuevoEstado} no está permitido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
        );
      }
  
      // Guardamos el estado anterior para el historial
      const estadoAnterior = detalle.estadoManual;
  
      // Actualizamos el estado
      await detalle.update({ estadoManual: nuevoEstado });
  
      // Creamos el historial en OrdenDetalleHistorial
      await OrdenDetalleHistorial.create({
        id_detalle: detalle.id_detalle,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        comentario: 'Cambio de estado manual vía endpoint',
        id_usuario: req.user.id_usuario, // el usuario que hizo el cambio
        fechaCambio: new Date()
      });
  
      res.status(200).json({ success: true, message: `Estado actualizado a ${nuevoEstado}.` });
    } catch (error) {
      logger.error(`Error al cambiar estado manual: ${error.message}`);
      next(error);
    }
  };

/**
 * Editar el detalle (tiempoEstimadoHoras, fechaEstimadaFin, prioridad, metaDatos, etc.)
 */
export const editarDetalle = async (req, res, next) => {
  try {
    const { id_detalle } = req.params;
    const { tiempoEstimadoHoras, fechaEstimadaFin, prioridad, metaDatos } = req.body;

    const detalle = await OrdenDetalle.findOne({
      where: { id_detalle },
      include: [{ model: Orden, as: 'orden' }],
    });
    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
    }
    if (detalle.orden.id_usuario !== req.user.id_usuario) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a esta orden' });
    }

    await detalle.update({
      tiempoEstimadoHoras: tiempoEstimadoHoras || detalle.tiempoEstimadoHoras,
      fechaEstimadaFin: fechaEstimadaFin || detalle.fechaEstimadaFin,
      prioridad: prioridad || detalle.prioridad,
      metaDatos: metaDatos || detalle.metaDatos,
    });

    res.status(200).json({
      success: true,
      message: 'Detalle actualizado exitosamente.',
      data: detalle,
    });
  } catch (error) {
    logger.error(`Error al editar detalle: ${error.message}`);
    next(error);
  }
};


/**
 * 2.5. Agregar un nuevo ítem (detalle) a una orden existente que no esté pagada
 * POST /ordenes/:id_orden/detalles
 */
export const addDetalleToOrden = async (req, res, next) => {
    try {
      const { id_orden } = req.params;
      const { tipoProducto, descripcion, cantidad, precioUnitario } = req.body;
  
      // 1) Buscar la orden y verificar que sea del usuario y no esté pagada
      const orden = await Orden.findOne({
        where: { id_orden, id_usuario: req.user.id_usuario },
        include: [{ model: OrdenDetalle, as: 'detalles' }],
      });
      if (!orden) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada o no pertenece al usuario.' });
      }
      if (orden.estado === 'pagado') {
        return res.status(400).json({ success: false, message: 'No se pueden agregar detalles a una orden pagada.' });
      }
  
      // 2) Crear el nuevo detalle
      const detalle = await OrdenDetalle.create({
        id_orden: orden.id_orden,
        tipoProducto,
        descripcion,
        cantidad: cantidad || 1,
        precioUnitario: precioUnitario || 0,
      });
  
      // 3) Calcular el subtotal del nuevo detalle
      const subtotal = parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnitario);
      await detalle.update({ subtotal });
  
      // 4) Recalcular el montoTotal de la orden (sumar el subtotal nuevo)
      const nuevoTotal = parseFloat(orden.montoTotal) + subtotal;
      await orden.update({ montoTotal: nuevoTotal });
  
      res.status(201).json({
        success: true,
        message: 'Detalle agregado correctamente.',
        data: { detalle, orden },
      });
    } catch (error) {
      logger.error(`Error al agregar detalle a la orden: ${error.message}`);
      next(error);
    }
  };
  
  /**
   * 2.6. Eliminar un OrdenDetalle de una orden (si no está pagada)
   * DELETE /ordenes/:id_orden/detalles/:id_detalle
   */
  export const removeDetalleFromOrden = async (req, res, next) => {
    try {
      const { id_orden, id_detalle } = req.params;
  
      // 1) Buscar la orden y el detalle
      const orden = await Orden.findOne({
        where: { id_orden, id_usuario: req.user.id_usuario },
        include: [{ model: OrdenDetalle, as: 'detalles' }],
      });
      if (!orden) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada o no pertenece al usuario.' });
      }
      if (orden.estado === 'pagado') {
        return res.status(400).json({ success: false, message: 'No se pueden eliminar detalles de una orden pagada.' });
      }
  
      const detalle = orden.detalles.find(d => d.id_detalle == id_detalle);
      if (!detalle) {
        return res.status(404).json({ success: false, message: 'Detalle no encontrado en la orden.' });
      }
  
      // 2) Resta su subtotal del montoTotal
      const nuevoTotal = parseFloat(orden.montoTotal) - parseFloat(detalle.subtotal);
  
      // 3) Eliminar el detalle
      await detalle.destroy();
  
      // 4) Actualizar la orden con el nuevo total
      await orden.update({ montoTotal: nuevoTotal });
  
      res.status(200).json({
        success: true,
        message: 'Detalle eliminado correctamente.',
        data: { orden: orden.id_orden, nuevoTotal },
      });
    } catch (error) {
      logger.error(`Error al eliminar detalle de la orden: ${error.message}`);
      next(error);
    }
  };
  
  /**
   * 2.7. Recalcular subtotal y actualizar la orden (método de utilidad).
   * Se podría hacer con un hook en OrdenDetalle, pero aquí hacemos un endpoint manual:
   * PUT /ordenes/:id_orden/detalles/:id_detalle/recalc
   */
  export const recalcularSubtotal = async (req, res, next) => {
    try {
      const { id_orden, id_detalle } = req.params;
  
      // 1) Buscar la orden y el detalle
      const orden = await Orden.findOne({
        where: { id_orden, id_usuario: req.user.id_usuario },
        include: [{ model: OrdenDetalle, as: 'detalles' }],
      });
      if (!orden) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada o no pertenece al usuario.' });
      }
      if (orden.estado === 'pagado') {
        return res.status(400).json({ success: false, message: 'No se pueden recalcular detalles de una orden pagada.' });
      }
  
      const detalle = orden.detalles.find(d => d.id_detalle == id_detalle);
      if (!detalle) {
        return res.status(404).json({ success: false, message: 'Detalle no encontrado en la orden.' });
      }
  
      // 2) Recalcular el subtotal del detalle
      const nuevoSubtotal = parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnitario);
      await detalle.update({ subtotal: nuevoSubtotal });
  
      // 3) Recalcular el montoTotal sumando subtotales de todos los detalles
      let totalRecalculado = 0;
      for (const d of orden.detalles) {
        if (d.id_detalle == detalle.id_detalle) {
          totalRecalculado += nuevoSubtotal;
        } else {
          totalRecalculado += parseFloat(d.subtotal);
        }
      }
      await orden.update({ montoTotal: totalRecalculado });
  
      res.status(200).json({
        success: true,
        message: 'Subtotal y montoTotal recalculados exitosamente.',
        data: { detalle, orden },
      });
    } catch (error) {
      logger.error(`Error al recalcular subtotal: ${error.message}`);
      next(error);
    }
  };
  
  /**
   * 2.8. Listar los OrdenDetalle asignados al usuario interno con id_asignado = req.user.id_usuario
   * GET /orden-detalles/assigned-to-me
   */
  export const listDetallesForAssignedUser = async (req, res, next) => {
    try {
      const userId = req.user.id_usuario;
      // Filtrar por id_asignado y estadoManual != 'Finalizado'
      const detalles = await OrdenDetalle.findAll({
        where: {
          id_asignado: userId,
          estadoManual: ['Abierto','Asignado','En Progreso'], 
          // O un operator (ne: 'Finalizado') en vez de un array
        },
        include: [
          {
            model: Orden,
            as: 'orden',
            // Podrías incluir el usuario de la orden para más info:
            // include: [{ model: Usuario, as: 'usuario' }]
          }
        ],
        order: [['createdAt', 'DESC']],
      });
  
      res.status(200).json({
        success: true,
        data: detalles,
      });
    } catch (error) {
      logger.error(`Error al listar detalles asignados: ${error.message}`);
      next(error);
    }
  };    