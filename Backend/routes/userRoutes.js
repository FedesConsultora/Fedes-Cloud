// routes/userRoutes.js
import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createUserValidation, updateUserValidation, getUserByIdValidation } from '../middlewares/validators/userValidator.js';

const router = Router();

// Ruta para crear un nuevo usuario (protegida, solo para usuarios con permisos)
router.post('/', authMiddleware, createUserValidation, userController.createUser);

// Rutas protegidas para operaciones CRUD
router.get('/', authMiddleware, userController.getUsers);
router.get('/:id', authMiddleware, getUserByIdValidation, userController.getUserById);
router.put('/:id', authMiddleware, updateUserValidation, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;
