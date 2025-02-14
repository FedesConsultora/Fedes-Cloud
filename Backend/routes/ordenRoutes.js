import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as ordenController from '../controllers/ordenController.js';

const router = Router();

// Crear una nueva orden (puede tener múltiples detalles dentro del body)
router.post('/', authMiddleware, ordenController.createOrden);

// Obtener todas las órdenes del usuario autenticado
router.get('/', authMiddleware, ordenController.getOrdenesByUser);

// Obtener una sola orden por ID
router.get('/:id_orden', authMiddleware, ordenController.getOrdenById);

// Actualizar estado de la orden (por ejemplo, si se cancela)
router.put('/:id_orden/cancel', authMiddleware, ordenController.cancelOrden);

// Endpoint para forzar "completar" la orden (si aplica un escenario especial)
router.put('/:id_orden/complete', authMiddleware, ordenController.completeOrden);

// Obtener resumen de cuántas órdenes hay en cada estado (sólo admin)
router.get('/summary', authMiddleware, ordenController.summaryByStatus);

// Listar todas las órdenes de todos los usuarios (sólo admin)
router.get('/all', authMiddleware, ordenController.listAllOrdenes);


export default router;
