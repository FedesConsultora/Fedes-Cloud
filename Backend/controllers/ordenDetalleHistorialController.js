import { OrdenDetalleHistorial, OrdenDetalle, Orden } from '../models/index.js';
import logger from '../utils/logger.js';

export const getHistorialByDetalle = async (req, res, next) => {
  try {
    const { id_detalle } = req.params;
    // Verificar que el detalle pertenezca al usuario
    const detalle = await OrdenDetalle.findOne({
      where: { id_detalle },
      include: [{ model: Orden, as: 'orden' }],
    });
    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
    }
    // Chequear que la orden sea del usuario
    if (detalle.orden.id_usuario !== req.user.id_usuario) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a este detalle' });
    }

    const historial = await OrdenDetalleHistorial.findAll({
      where: { id_detalle },
      order: [['fechaCambio', 'ASC']],
      include: [{ model: OrdenDetalle, as: 'detalle' }],
    });

    res.status(200).json({ success: true, data: historial });
  } catch (error) {
    logger.error(`Error al obtener historial: ${error.message}`);
    next(error);
  }
};


/**
 * 4.2. Ver todos los cambios de estado de todos los detalles de una orden
 * Endpoint: GET /ordenes/:id_orden/historial
 */
export const getHistorialByOrden = async (req, res, next) => {
    try {
      const { id_orden } = req.params;
  
      // 1) Buscar la Orden y verificar que pertenezca al usuario actual (o que sea admin)
      //    Ajusta la validación de permisos según tu negocio
      const orden = await Orden.findOne({
        where: { 
          id_orden,
          id_usuario: req.user.id_usuario
          // O si el rol es admin, quizás no requieras filtrar por id_usuario.
        },
        include: [{ model: OrdenDetalle, as: 'detalles' }],
      });
  
      if (!orden) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada o no pertenece al usuario.' });
      }
  
      // 2) Extraer los IDs de todos los detalles de la orden
      const detallesIds = orden.detalles.map(d => d.id_detalle);
      if (detallesIds.length === 0) {
        // Si no hay detalles en la orden
        return res.status(200).json({ success: true, data: [] });
      }
  
      // 3) Consultar la tabla OrdenDetalleHistorial para obtener todos los registros
      //    cuyo id_detalle esté en la lista
      const historial = await OrdenDetalleHistorial.findAll({
        where: { id_detalle: { [Op.in]: detallesIds } },
        order: [['fechaCambio', 'ASC']], // cronológicamente
        include: [
          {
            model: OrdenDetalle,
            as: 'detalle',
            attributes: ['id_detalle', 'tipoProducto', 'descripcion'],
          },
          {
            model: Usuario, // si quieres mostrar quién hizo el cambio
            as: 'autor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ],
      });
  
      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error) {
      logger.error(`Error al obtener historial de la orden: ${error.message}`);
      next(error);
    }
  };
  
  /**
   * 4.3. Filtrar Historial (por rango de fechas, usuario, estadoAnterior/estadoNuevo, etc.)
   * Endpoint: GET /ordenes/historial/filter
   * (o /orden-detalles/historial/filter) -> según tu preferencia
   * 
   * Requiere rol admin (o similar).
   * 
   * Ejemplo de query params:
   *   ?fromDate=2023-01-01&toDate=2023-12-31&autor=5&estadoNuevo=En+Progreso
   */
  export const filterHistorial = async (req, res, next) => {
    try {
      // Verificar si el usuario es admin
      // Usa tu propia lógica de roles
      if (req.user.rol !== 'admin') {
        throw new PermissionDeniedError('No tienes permisos para filtrar historial.');
      }
  
      // 1) Extraer query params
      const { fromDate, toDate, autor, estadoNuevo, estadoAnterior } = req.query;
  
      // Construir el objeto "where" dinámicamente
      const whereClause = {};
  
      // Filtro por rango de fechas
      // Asumimos que fromDate y toDate vienen en formato YYYY-MM-DD
      if (fromDate && toDate) {
        whereClause.fechaCambio = {
          [Op.between]: [new Date(fromDate), new Date(toDate)]
        };
      } else if (fromDate) {
        whereClause.fechaCambio = {
          [Op.gte]: new Date(fromDate)
        };
      } else if (toDate) {
        whereClause.fechaCambio = {
          [Op.lte]: new Date(toDate)
        };
      }
  
      // Filtro por autor (id_usuario)
      if (autor) {
        whereClause.id_usuario = autor;
      }
  
      // Filtro por estadoNuevo
      if (estadoNuevo) {
        whereClause.estadoNuevo = estadoNuevo;
      }
  
      // Filtro por estadoAnterior
      if (estadoAnterior) {
        whereClause.estadoAnterior = estadoAnterior;
      }
  
      // 2) Consultar
      const historiales = await OrdenDetalleHistorial.findAll({
        where: whereClause,
        order: [['fechaCambio', 'ASC']],
        include: [
          {
            model: OrdenDetalle,
            as: 'detalle',
            attributes: ['id_detalle', 'tipoProducto', 'descripcion'],
          },
          {
            model: Usuario, 
            as: 'autor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ],
      });
  
      res.status(200).json({
        success: true,
        data: historiales
      });
    } catch (error) {
      logger.error(`Error al filtrar historial: ${error.message}`);
      next(error);
    }
  };

  