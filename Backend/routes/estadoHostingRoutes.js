// routes/estadoHostingRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as estadoHostingController from '../controllers/estadoHostingController.js';

const router = Router();

// Opcional: aplicar middleware para admin si es necesario
router.post('/', authMiddleware, estadoHostingController.createEstadoHosting);
router.get('/', authMiddleware, estadoHostingController.getAllEstadoHosting);
router.get('/:id', authMiddleware, estadoHostingController.getEstadoHostingById);
router.put('/:id', authMiddleware, estadoHostingController.updateEstadoHosting);
router.delete('/:id', authMiddleware, estadoHostingController.deleteEstadoHosting);

export default router;
