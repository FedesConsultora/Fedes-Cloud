// routes/permisoRoutes.js
import { Router } from 'express';
import * as permisoController from '../controllers/permisoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  createPermisoValidation,
  getPermisoByIdValidation,
  updatePermisoValidation,
  deletePermisoValidation,
} from '../middlewares/validators/permisoValidator.js';

const router = Router();

// Verifica que las funciones del controlador están definidas
console.log('permisoController:', permisoController);

// Crear un nuevo permiso
router.post(
  '/',
  authMiddleware,
  createPermisoValidation,
  permisoController.createPermiso
);

// Obtener todos los permisos
router.get(
  '/',
  authMiddleware,
  permisoController.getPermisos
);

// Obtener un permiso por ID
router.get(
  '/:id_permiso',
  authMiddleware,
  getPermisoByIdValidation,
  permisoController.getPermisoById
);

// Actualizar un permiso existente
router.put(
  '/:id_permiso',
  authMiddleware,
  updatePermisoValidation,
  permisoController.updatePermiso
);

// Eliminar un permiso
router.delete(
  '/:id_permiso',
  authMiddleware,
  deletePermisoValidation,
  permisoController.deletePermiso
);

export default router;
