// controllers/CartItemAddonController.js
import { ComplementoItemCarrito } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Add an addon to a cart item.
 * Expects in req.body: id_item_carrito, tipoComplemento, descripcionComplemento (optional), precio, and optionally categoria.
 */
export const addCartItemAddon = async (req, res, next) => {
  try {
    const { id_item_carrito, id_catalogo ,tipoComplemento, descripcionComplemento, precio, categoria } = req.body;

    if (!id_item_carrito || !tipoComplemento || !precio) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields to add the addon.'
      });
    }
    const newAddon = await ComplementoItemCarrito.create({
      id_item_carrito,
      id_catalogo, 
      tipoComplemento,
      descripcionComplemento: descripcionComplemento || null,
      precio,
      categoria: categoria || null,
    });
    logger.info(`Addon added to cart item ${id_item_carrito}: ID ${newAddon.id_complemento}`);
    res.status(201).json({
      success: true,
      message: 'Addon added successfully.',
      data: newAddon,
    });
  } catch (error) {
    logger.error(`Error adding addon to cart item: ${error.message}`);
    next(error);
  }
};

/**
 * Get all addons for a given cart item.
 * Expects id_item in req.params.
 */
export const getAddonsByCartItem = async (req, res, next) => {
  try {
    const { id_item } = req.params;
    if (!id_item) {
      return res.status(400).json({
        success: false,
        message: 'Cart item ID is required.'
      });
    }
    const addons = await ComplementoItemCarrito.findAll({
      where: { id_item_carrito: id_item },
    });
    res.status(200).json({
      success: true,
      data: addons,
    });
  } catch (error) {
    logger.error(`Error fetching addons: ${error.message}`);
    next(error);
  }
};

/**
 * Update an addon for a cart item.
 */
export const updateCartItemAddon = async (req, res, next) => {
  try {
    const { id_complemento } = req.params;
    const addon = await ComplementoItemCarrito.findByPk(id_complemento);
    if (!addon) {
      return res.status(404).json({
        success: false,
        message: 'Addon not found.'
      });
    }
    await addon.update(req.body);
    logger.info(`Addon ID ${id_complemento} updated`);
    res.status(200).json({
      success: true,
      message: 'Addon updated successfully.',
      data: addon,
    });
  } catch (error) {
    logger.error(`Error updating addon: ${error.message}`);
    next(error);
  }
};

/**
 * Delete an addon from a cart item.
 */
export const deleteCartItemAddon = async (req, res, next) => {
  try {
    const { id_complemento } = req.params;
    const addon = await ComplementoItemCarrito.findByPk(id_complemento);
    if (!addon) {
      return res.status(404).json({
        success: false,
        message: 'Addon not found.'
      });
    }
    await addon.destroy();
    logger.info(`Addon ID ${id_complemento} deleted`);
    res.status(200).json({
      success: true,
      message: 'Addon deleted successfully.'
    });
  } catch (error) {
    logger.error(`Error deleting addon: ${error.message}`);
    next(error);
  }
};
