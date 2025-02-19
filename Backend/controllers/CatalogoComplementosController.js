// controllers/CatalogoComplementosController.js
import { CatalogoComplementos } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Get all catalog addons.
 */
export const getAllCatalogItems = async (req, res, next) => {
  try {
    const catalogItems = await CatalogoComplementos.findAll();
    res.status(200).json({
      success: true,
      data: catalogItems,
    });
  } catch (error) {
    logger.error(`Error fetching catalog addons: ${error.message}`);
    next(error);
  }
};

/**
 * Get a specific catalog addon by ID.
 */
export const getCatalogItemById = async (req, res, next) => {
  try {
    const { id_catalogo } = req.params;
    const catalogItem = await CatalogoComplementos.findByPk(id_catalogo);
    if (!catalogItem) {
      return res.status(404).json({
        success: false,
        message: 'Catalog addon not found.',
      });
    }
    res.status(200).json({
      success: true,
      data: catalogItem,
    });
  } catch (error) {
    logger.error(`Error fetching catalog addon by ID: ${error.message}`);
    next(error);
  }
};

/**
 * (Optional) Create a new catalog addon.
 * Este endpoint podría estar restringido a administradores.
 */
export const createCatalogItem = async (req, res, next) => {
  try {
    const { tipoComplemento, descripcionComplemento, precio, categoria } = req.body;
    if (!tipoComplemento || !precio) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tipoComplemento and precio are required.',
      });
    }
    const newCatalogItem = await CatalogoComplementos.create({
      tipoComplemento,
      descripcionComplemento: descripcionComplemento || null,
      precio,
      categoria: categoria || null,
    });
    logger.info(`Catalog addon created: ID ${newCatalogItem.id_catalogo}`);
    res.status(201).json({
      success: true,
      message: 'Catalog addon created successfully.',
      data: newCatalogItem,
    });
  } catch (error) {
    logger.error(`Error creating catalog addon: ${error.message}`);
    next(error);
  }
};

/**
 * (Optional) Update a catalog addon.
 * Este endpoint podría estar restringido a administradores.
 */
export const updateCatalogItem = async (req, res, next) => {
  try {
    const { id_catalogo } = req.params;
    const catalogItem = await CatalogoComplementos.findByPk(id_catalogo);
    if (!catalogItem) {
      return res.status(404).json({
        success: false,
        message: 'Catalog addon not found.',
      });
    }
    await catalogItem.update(req.body);
    logger.info(`Catalog addon ID ${id_catalogo} updated`);
    res.status(200).json({
      success: true,
      message: 'Catalog addon updated successfully.',
      data: catalogItem,
    });
  } catch (error) {
    logger.error(`Error updating catalog addon: ${error.message}`);
    next(error);
  }
};

/**
 * (Optional) Delete a catalog addon.
 * Este endpoint podría estar restringido a administradores.
 */
export const deleteCatalogItem = async (req, res, next) => {
  try {
    const { id_catalogo } = req.params;
    const catalogItem = await CatalogoComplementos.findByPk(id_catalogo);
    if (!catalogItem) {
      return res.status(404).json({
        success: false,
        message: 'Catalog addon not found.',
      });
    }
    await catalogItem.destroy();
    logger.info(`Catalog addon ID ${id_catalogo} deleted`);
    res.status(200).json({
      success: true,
      message: 'Catalog addon deleted successfully.',
    });
  } catch (error) {
    logger.error(`Error deleting catalog addon: ${error.message}`);
    next(error);
  }
};
