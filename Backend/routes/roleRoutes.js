// routes/roleRoutes.js
import { Router } from 'express';
const router = Router();
import * as roleController from '../controllers/roleController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

// Rutas protegidas con autenticación
router.post('/', authMiddleware, roleController.createRole);
router.get('/', authMiddleware, roleController.getRoles);
router.get('/:id', authMiddleware, roleController.getRoleById);
router.put('/:id', authMiddleware, roleController.updateRole);
router.delete('/:id', authMiddleware, roleController.deleteRole);

export default router;

