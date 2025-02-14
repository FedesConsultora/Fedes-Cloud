import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as historialController from '../controllers/ordenDetalleHistorialController.js';

const router = Router();

router.get('/:id_detalle', authMiddleware, historialController.getHistorialByDetalle);


/**
 * (4.2) Ver todos los cambios de estado de todos los detalles de una orden
 * GET /ordenes/:id_orden/historial
 * - Suele requerir authMiddleware
 */
router.get('/:id_orden/historial', authMiddleware, historialController.getHistorialByOrden);

/**
 * (4.3) Filtrar historial (admin)
 * GET /ordenes/historial/filter
 * - Lógica: se pasa query params: fromDate, toDate, autor, estadoAnterior, estadoNuevo
 */
router.get('/historial/filter', authMiddleware, historialController.filterHistorial);


export default router;
