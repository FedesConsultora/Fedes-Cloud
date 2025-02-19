// routes/CatalogoComplementosRoutes.js
import { Router } from 'express';
import {
  getAllCatalogItems,
  getCatalogItemById,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem
} from '../controllers/CatalogoComplementosController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Opcional, podrías agregar un middleware de admin

const router = Router();

// Get all catalog addons
router.get('/', authMiddleware, getAllCatalogItems);

// Get a specific catalog addon by ID
router.get('/:id_catalogo', authMiddleware, getCatalogItemById);

// (Optional) Create a new catalog addon - restrict to admin if needed
router.post('/', authMiddleware, createCatalogItem);

// (Optional) Update a catalog addon - restrict to admin if needed
router.put('/:id_catalogo', authMiddleware, updateCatalogItem);

// (Optional) Delete a catalog addon - restrict to admin if needed
router.delete('/:id_catalogo', authMiddleware, deleteCatalogItem);

export default router;
