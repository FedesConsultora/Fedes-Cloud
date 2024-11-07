// routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

// Rutas protegidas con autenticación
router.get('/', authMiddleware, userController.getUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

// Ruta para crear un usuario (puede estar protegida o no)
router.post('/', userController.createUser);

export default router;
