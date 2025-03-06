// routes/impuestoRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { 
  createImpuesto, 
  getAllImpuestos, 
  getImpuestoById, 
  updateImpuesto, 
  deleteImpuesto 
} from '../controllers/impuestoController.js';

const router = Router();

// Crear un nuevo impuesto
router.post('/', authMiddleware, createImpuesto);

// Obtener todos los impuestos
router.get('/', authMiddleware, getAllImpuestos);

// Obtener un impuesto por ID
router.get('/:id', authMiddleware, getImpuestoById);

// Actualizar un impuesto
router.put('/:id', authMiddleware, updateImpuesto);

// Eliminar un impuesto
router.delete('/:id', authMiddleware, deleteImpuesto);

export default router;
