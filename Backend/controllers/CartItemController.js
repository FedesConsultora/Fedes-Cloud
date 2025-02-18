// controllers/CartItemController.js
import { CartItem } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Add a new item to the cart.
 * Expects in req.body: id_carrito, tipoProducto, productoId (optional), descripcion, cantidad, and precioUnitario.
 * Subtotal is calculated as cantidad * precioUnitario.
 */
export const addCartItem = async (req, res, next) => {
  try {
    const { id_carrito, tipoProducto, productoId, descripcion, cantidad, precioUnitario } = req.body;
    if (!id_carrito || !tipoProducto || !descripcion || !cantidad || !precioUnitario) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields to add the cart item.'
      });
    }
    const subtotal = parseFloat(cantidad) * parseFloat(precioUnitario);
    const newItem = await CartItem.create({
      id_carrito,
      tipoProducto,
      productoId: productoId || null,
      descripcion,
      cantidad,
      precioUnitario,
      subtotal,
    });
    logger.info(`Cart item added to cart ${id_carrito}: ID ${newItem.id_item}`);
    res.status(201).json({
      success: true,
      message: 'Cart item added successfully.',
      data: newItem,
    });
  } catch (error) {
    logger.error(`Error adding cart item: ${error.message}`);
    next(error);
  }
};

/**
 * Get all items for a given cart.
 * Expects id_carrito in req.params.
 */
export const getCartItems = async (req, res, next) => {
  try {
    const { id_carrito } = req.params;
    if (!id_carrito) {
      return res.status(400).json({
        success: false,
        message: 'Cart ID is required.'
      });
    }
    const items = await CartItem.findAll({
      where: { id_carrito },
      include: [{ association: 'complementos' }],
    });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    logger.error(`Error fetching cart items: ${error.message}`);
    next(error);
  }
};

/**
 * Update a cart item.
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { id_item } = req.params;
    const item = await CartItem.findByPk(id_item);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }
    const { cantidad, precioUnitario } = req.body;
    const updatedData = { ...req.body };
    if (cantidad && precioUnitario) {
      updatedData.subtotal = parseFloat(cantidad) * parseFloat(precioUnitario);
    }
    await item.update(updatedData);
    logger.info(`Cart item ID ${id_item} updated`);
    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully.',
      data: item,
    });
  } catch (error) {
    logger.error(`Error updating cart item: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a cart item.
 */
export const deleteCartItem = async (req, res, next) => {
  try {
    const { id_item } = req.params;
    const item = await CartItem.findByPk(id_item);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }
    await item.destroy();
    logger.info(`Cart item ID ${id_item} deleted`);
    res.status(200).json({
      success: true,
      message: 'Cart item deleted successfully.'
    });
  } catch (error) {
    logger.error(`Error deleting cart item: ${error.message}`);
    next(error);
  }
};
