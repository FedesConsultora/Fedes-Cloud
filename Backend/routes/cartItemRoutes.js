// routes/cartItemRoutes.js
import { Router } from 'express';
import { addCartItem, getCartItems, updateCartItem, deleteCartItem } from '../controllers/CartItemController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Add new cart item
router.post('/', authMiddleware, addCartItem);

// Get all items for a cart (expects :id_carrito)
router.get('/cart/:id_carrito', authMiddleware, getCartItems);

// Update a cart item (expects :id_item)
router.put('/:id_item', authMiddleware, updateCartItem);

// Delete a cart item (expects :id_item)
router.delete('/:id_item', authMiddleware, deleteCartItem);

export default router;
