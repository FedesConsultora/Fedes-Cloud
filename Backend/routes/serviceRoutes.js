import { Router } from 'express';
import * as serviceController from '../controllers/servicioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  createServiceValidation,
  getServiceByIdValidation,
  updateServiceValidation,
  deleteServiceValidation,
} from '../middlewares/validators/serviceValidator.js';

const router = Router();

// Crear un nuevo servicio
router.post(
  '/',
  authMiddleware,
  createServiceValidation,
  serviceController.createService
);

// Obtener todos los servicios
router.get(
  '/',
  authMiddleware,
  serviceController.getServices
);

// Obtener un servicio por ID
router.get(
  '/:id_servicio',
  authMiddleware,
  getServiceByIdValidation,
  serviceController.getServiceById
);

// Actualizar un servicio existente
router.put(
  '/:id_servicio',
  authMiddleware,
  updateServiceValidation,
  serviceController.updateService
);

// Eliminar un servicio
router.delete(
  '/:id_servicio',
  authMiddleware,
  deleteServiceValidation,
  serviceController.deleteService
);

export default router;
