// routes/roleRoutes.js
import { Router } from 'express';
import * as roleController from '../controllers/roleController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createRoleValidation, getRoleByIdValidation, updateRoleValidation } from '../middlewares/validators/roleValidator.js';

const router = Router();

// Crear un nuevo rol
router.post('/', authMiddleware, createRoleValidation, roleController.createRole);

// Obtener todos los roles
router.get('/', authMiddleware, roleController.getRoles);

// Obtener un rol por ID
router.get('/:id', authMiddleware, getRoleByIdValidation, roleController.getRoleById);

// Actualizar un rol existente
router.put('/:id', authMiddleware, updateRoleValidation, roleController.updateRole);

// Eliminar un rol
router.delete('/:id', authMiddleware, roleController.deleteRole);

export default router;

