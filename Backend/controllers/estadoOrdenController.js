// controllers/estadoOrdenController.js
import { EstadoOrden } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Crea un nuevo EstadoOrden.
 * Ej: { nombre: "Pendiente" }
 */
export const createEstadoOrden = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio.' });
    }
    const nuevoEstado = await EstadoOrden.create({ nombre });
    res.status(201).json({ success: true, data: nuevoEstado });
  } catch (error) {
    logger.error(`Error creando EstadoOrden: ${error.message}`);
    next(error);
  }
};

/**
 * Obtiene todos los EstadosOrden.
 */
export const getAllEstadoOrden = async (req, res, next) => {
  try {
    const estados = await EstadoOrden.findAll();
    res.status(200).json({ success: true, data: estados });
  } catch (error) {
    logger.error(`Error obteniendo EstadosOrden: ${error.message}`);
    next(error);
  }
};

/**
 * Obtiene un EstadoOrden por su ID.
 */
export const getEstadoOrdenById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await EstadoOrden.findByPk(id);
    if (!estado) {
      return res.status(404).json({ success: false, message: 'EstadoOrden no encontrado.' });
    }
    res.status(200).json({ success: true, data: estado });
  } catch (error) {
    logger.error(`Error obteniendo EstadoOrden: ${error.message}`);
    next(error);
  }
};

/**
 * Actualiza un EstadoOrden.
 */
export const updateEstadoOrden = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const estado = await EstadoOrden.findByPk(id);
    if (!estado) {
      return res.status(404).json({ success: false, message: 'EstadoOrden no encontrado.' });
    }
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio.' });
    }
    await estado.update({ nombre });
    res.status(200).json({ success: true, data: estado });
  } catch (error) {
    logger.error(`Error actualizando EstadoOrden: ${error.message}`);
    next(error);
  }
};

/**
 * Elimina un EstadoOrden.
 */
export const deleteEstadoOrden = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await EstadoOrden.findByPk(id);
    if (!estado) {
      return res.status(404).json({ success: false, message: 'EstadoOrden no encontrado.' });
    }
    await estado.destroy();
    res.status(200).json({ success: true, message: 'EstadoOrden eliminado exitosamente.' });
  } catch (error) {
    logger.error(`Error eliminando EstadoOrden: ${error.message}`);
    next(error);
  }
};
