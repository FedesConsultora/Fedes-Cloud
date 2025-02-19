// controllers/CartController.js
import { Carrito } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Create a new cart for the given user.
 * Expects: { id_usuario } in the request body.
 */
export const createCart = async (req, res, next) => {
  try {
    const { id_usuario } = req.body;
    if (!id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required to create a cart.'
      });
    }
    const newCart = await Cart.create({ id_usuario, estado: 'active' });
    logger.info(`Cart created for user ${id_usuario}: ID ${newCart.id_carrito}`);
    res.status(201).json({
      success: true,
      message: 'Cart created successfully.',
      data: newCart
    });
  } catch (error) {
    logger.error(`Error creating cart: ${error.message}`);
    next(error);
  }
};

/**
 * Get the active cart for a given user.
 * Expects: id_usuario in req.params.
 */
export const getCartByUser = async (req, res, next) => {
  try {
    const { id_usuario } = req.params;
    if (!id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }
    const cart = await Cart.findOne({
      where: { id_usuario, estado: 'active' },
      include: [{ association: 'items', include: [{ association: 'complementos' }] }],
    });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'No active cart found for this user.'
      });
    }
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    logger.error(`Error fetching cart: ${error.message}`);
    next(error);
  }
};

/**
 * Update a cart (for example, to change its status or total).
 */
export const updateCart = async (req, res, next) => {
  try {
    const { id_cart } = req.params;
    const cart = await Cart.findByPk(id_cart);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }
    await cart.update(req.body);
    logger.info(`Cart ID ${id_cart} updated`);
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      data: cart
    });
  } catch (error) {
    logger.error(`Error updating cart: ${error.message}`);
    next(error);
  }
};

/**
 * Delete (or empty) a cart.
 */
export const deleteCart = async (req, res, next) => {
  try {
    const { id_cart } = req.params;
    const cart = await Cart.findByPk(id_cart);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }
    await cart.destroy();
    logger.info(`Cart ID ${id_cart} deleted`);
    res.status(200).json({
      success: true,
      message: 'Cart deleted successfully.'
    });
  } catch (error) {
    logger.error(`Error deleting cart: ${error.message}`);
    next(error);
  }
};
