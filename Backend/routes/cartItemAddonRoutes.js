// routes/cartItemAddonRoutes.js
import { Router } from 'express';
import {
  addCartItemAddon,
  getAddonsByCartItem,
  updateCartItemAddon,
  deleteCartItemAddon,
} from '../controllers/CartItemAddonController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Add an addon to a cart item
router.post('/', authMiddleware, addCartItemAddon);

// Get addons for a cart item (expects :id_item)
router.get('/item/:id_item', authMiddleware, getAddonsByCartItem);

// Update an addon (expects :id_complemento)
router.put('/:id_complemento', authMiddleware, updateCartItemAddon);

// Delete an addon (expects :id_complemento)
router.delete('/:id_complemento', authMiddleware, deleteCartItemAddon);

export default router;
