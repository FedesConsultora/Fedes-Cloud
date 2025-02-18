// routes/estadoOrdenRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as estadoOrdenController from '../controllers/estadoOrdenController.js';

const router = Router();

// Puedes aplicar un middleware adicional (p.ej., isAdmin) si deseas restringir el CRUD solo a administradores.

router.post('/', authMiddleware, estadoOrdenController.createEstadoOrden);
router.get('/', authMiddleware, estadoOrdenController.getAllEstadoOrden);
router.get('/:id', authMiddleware, estadoOrdenController.getEstadoOrdenById);
router.put('/:id', authMiddleware, estadoOrdenController.updateEstadoOrden);
router.delete('/:id', authMiddleware, estadoOrdenController.deleteEstadoOrden);

export default router;
