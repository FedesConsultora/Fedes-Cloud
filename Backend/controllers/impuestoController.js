import { Impuesto } from '../models/index.js';
import logger from '../utils/logger.js';

export const createImpuesto = async (req, res, next) => {
  try {
    // Verificar que el usuario sea admin
    if (!req.user || !req.user.rol || req.user.rol.nombre !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso no autorizado. Se requiere nivel de administrador.' 
      });
    }

    const { nombre, porcentaje } = req.body;
    if (!nombre || porcentaje === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo "nombre" y "porcentaje" son obligatorios.' 
      });
    }
    const nuevoImpuesto = await Impuesto.create({ nombre, porcentaje });
    res.status(201).json({ success: true, data: nuevoImpuesto });
  } catch (error) {
    logger.error(`Error creando Impuesto: ${error.message}`);
    next(error);
  }
};

export const getAllImpuestos = async (req, res, next) => {
  try {
    // Verificar que el usuario sea admin
    if (!req.user || !req.user.rol) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso no autorizado. Se requiere nivel de administrador.' 
      });
    }

    const impuestos = await Impuesto.findAll();
    res.status(200).json({ success: true, data: impuestos });
  } catch (error) {
    logger.error(`Error obteniendo Impuestos: ${error.message}`);
    next(error);
  }
};

export const getImpuestoById = async (req, res, next) => {
  try {
    // Verificar que el usuario sea admin
    if (!req.user || !req.user.rol || req.user.rol.nombre !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso no autorizado. Se requiere nivel de administrador.' 
      });
    }

    const { id } = req.params;
    const impuesto = await Impuesto.findByPk(id);
    if (!impuesto) {
      return res.status(404).json({ success: false, message: 'Impuesto no encontrado.' });
    }
    res.status(200).json({ success: true, data: impuesto });
  } catch (error) {
    logger.error(`Error obteniendo Impuesto: ${error.message}`);
    next(error);
  }
};

export const updateImpuesto = async (req, res, next) => {
  try {
    // Verificar que el usuario sea admin
    if (!req.user || !req.user.rol || req.user.rol.nombre !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso no autorizado. Se requiere nivel de administrador.' 
      });
    }

    const { id } = req.params;
    const { nombre, porcentaje } = req.body;
    const impuesto = await Impuesto.findByPk(id);
    if (!impuesto) {
      return res.status(404).json({ success: false, message: 'Impuesto no encontrado.' });
    }
    if (!nombre || porcentaje === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo "nombre" y "porcentaje" son obligatorios.' 
      });
    }
    await impuesto.update({ nombre, porcentaje });
    res.status(200).json({ success: true, data: impuesto });
  } catch (error) {
    logger.error(`Error actualizando Impuesto: ${error.message}`);
    next(error);
  }
};

export const deleteImpuesto = async (req, res, next) => {
  try {
    // Verificar que el usuario sea admin
    if (!req.user || !req.user.rol || req.user.rol.nombre !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso no autorizado. Se requiere nivel de administrador.' 
      });
    }

    const { id } = req.params;
    const impuesto = await Impuesto.findByPk(id);
    if (!impuesto) {
      return res.status(404).json({ success: false, message: 'Impuesto no encontrado.' });
    }
    await impuesto.destroy();
    res.status(200).json({ success: true, message: 'Impuesto eliminado exitosamente.' });
  } catch (error) {
    logger.error(`Error eliminando Impuesto: ${error.message}`);
    next(error);
  }
};