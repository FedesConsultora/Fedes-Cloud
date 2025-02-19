// routes/cartRoutes.js
import { Router } from 'express';
import { createCart, getCartByUser, updateCart, deleteCart } from '../controllers/CartController..js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Create a new cart
router.post('/', authMiddleware, createCart);

// Get active cart for a user (expects :id_usuario)
router.get('/user/:id_usuario', authMiddleware, getCartByUser);

// Update a cart (expects :id_cart)
router.put('/:id_cart', authMiddleware, updateCart);

// Delete a cart (expects :id_cart)
router.delete('/:id_cart', authMiddleware, deleteCart);

export default router;
