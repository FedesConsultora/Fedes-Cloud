// controllers/estadoHostingController.js
import { EstadoHosting } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Crea un nuevo EstadoHosting.
 * Ejemplo: { nombre: "Activo" }
 */
export const createEstadoHosting = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio.' });
    }
    const nuevoEstado = await EstadoHosting.create({ nombre });
    res.status(201).json({ success: true, data: nuevoEstado });
  } catch (error) {
    logger.error(`Error creando EstadoHosting: ${error.message}`);
    next(error);
  }
};

/**
 * Obtiene todos los EstadosHosting.
 */
export const getAllEstadoHosting = async (req, res, next) => {
  try {
    const estados = await EstadoHosting.findAll();
    res.status(200).json({ success: true, data: estados });
  } catch (error) {
    logger.error(`Error obteniendo EstadosHosting: ${error.message}`);
    next(error);
  }
};

/**
 * Obtiene un EstadoHosting por su ID.
 */
export const getEstadoHostingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await EstadoHosting.findByPk(id);
    if (!estado) {
      return res.status(404).json({ success: false, message: 'EstadoHosting no encontrado.' });
    }
    res.status(200).json({ success: true, data: estado });
  } catch (error) {
    logger.error(`Error obteniendo EstadoHosting: ${error.message}`);
    next(error);
  }
};

/**
 * Actualiza un EstadoHosting.
 */
export const updateEstadoHosting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const estado = await EstadoHosting.findByPk(id);
    if (!estado) {
      return res.status(404).json({ success: false, message: 'EstadoHosting no encontrado.' });
    }
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio.' });
    }
    await estado.update({ nombre });
    res.status(200).json({ success: true, data: estado });
  } catch (error) {
    logger.error(`Error actualizando EstadoHosting: ${error.message}`);
    next(error);
  }
};

/**
 * Elimina un EstadoHosting.
 */
export const deleteEstadoHosting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await EstadoHosting.findByPk(id);
    if (!estado) {
      return res.status(404).json({ success: false, message: 'EstadoHosting no encontrado.' });
    }
    await estado.destroy();
    res.status(200).json({ success: true, message: 'EstadoHosting eliminado exitosamente.' });
  } catch (error) {
    logger.error(`Error eliminando EstadoHosting: ${error.message}`);
    next(error);
  }
};
