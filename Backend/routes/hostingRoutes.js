// routes/hostingRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as hostingController from '../controllers/hostingController.js';

const router = Router();

// Rutas para CRUD de Hosting
router.post('/', authMiddleware, hostingController.createHosting);
router.get('/user/:id_usuario', authMiddleware, hostingController.getHostingsByUser);
router.get('/:id', authMiddleware, hostingController.getHostingById);
router.put('/:id', authMiddleware, hostingController.updateHosting);
router.delete('/:id', authMiddleware, hostingController.deleteHosting);

export default router;
