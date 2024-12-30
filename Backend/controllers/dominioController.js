// controllers/dominioController.js
import { Dominio, Servicio } from '../models/index.js';
import { ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import { PermissionDeniedError } from '../utils/errors/GeneralErrors.js';
import godaddyService from '../factories/godaddyServiceFactory.js';

/**
 * Crear un nuevo dominio asociado a un servicio.
 */
export const createDominio = async (req, res, next) => {
  try {
    // Verificar permisos (ejemplo)
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para crear dominios.');
    }

    const { id_servicio, nombreDominio, fechaExpiracion, bloqueado, proteccionPrivacidad } = req.body;

    // Verificar que el servicio exista (opcional, pero recomendado)
    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) {
      throw new ValidationError(`El servicio con ID ${id_servicio} no existe.`);
    }

    const nuevoDominio = await Dominio.create({
      id_servicio,
      nombreDominio,
      fechaExpiracion,
      bloqueado,
      proteccionPrivacidad,
    });

    logger.info(`Dominio creado exitosamente: ID ${nuevoDominio.id_dominio}`);

    res.status(201).json({
      success: true,
      message: 'Dominio creado exitosamente',
      data: nuevoDominio,
    });
  } catch (error) {
    logger.error(`Error al crear dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener todos los dominios.
 */
export const getDominios = async (req, res, next) => {
  try {
    // Verificar permisos (ejemplo)
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver dominios.');
    }

    const dominios = await Dominio.findAll({
      include: [Servicio], // o si quieres omitirlo, quítalo
    });

    res.status(200).json({
      success: true,
      message: 'Dominios obtenidos exitosamente',
      data: dominios,
    });
  } catch (error) {
    logger.error(`Error al obtener dominios: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un dominio por su ID.
 */
export const getDominioById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver este dominio.');
    }

    const { id_dominio } = req.params;

    const dominio = await Dominio.findByPk(id_dominio, {
      include: [Servicio],
    });

    if (!dominio) {
      return res.status(404).json({
        success: false,
        message: `Dominio con ID ${id_dominio} no encontrado.`,
      });
    }

    res.status(200).json({
      success: true,
      data: dominio,
    });
  } catch (error) {
    logger.error(`Error al obtener dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un dominio existente.
 */
export const updateDominio = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar dominios.');
    }

    const { id_dominio } = req.params;
    const { nombreDominio, fechaExpiracion, bloqueado, proteccionPrivacidad } = req.body;

    const dominio = await Dominio.findByPk(id_dominio);
    if (!dominio) {
      return res.status(404).json({
        success: false,
        message: `Dominio con ID ${id_dominio} no encontrado.`,
      });
    }

    if (nombreDominio !== undefined) dominio.nombreDominio = nombreDominio;
    if (fechaExpiracion !== undefined) dominio.fechaExpiracion = fechaExpiracion;
    if (bloqueado !== undefined) dominio.bloqueado = bloqueado;
    if (proteccionPrivacidad !== undefined) dominio.proteccionPrivacidad = proteccionPrivacidad;

    await dominio.save();

    logger.info(`Dominio actualizado: ID ${id_dominio}`);

    res.status(200).json({
      success: true,
      message: 'Dominio actualizado exitosamente',
      data: dominio,
    });
  } catch (error) {
    logger.error(`Error al actualizar dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un dominio.
 */
export const deleteDominio = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para eliminar dominios.');
    }

    const { id_dominio } = req.params;
    const dominio = await Dominio.findByPk(id_dominio);

    if (!dominio) {
      return res.status(404).json({
        success: false,
        message: `Dominio con ID ${id_dominio} no encontrado.`,
      });
    }

    await dominio.destroy();

    logger.info(`Dominio eliminado: ID ${id_dominio}`);

    res.status(200).json({
      success: true,
      message: 'Dominio eliminado exitosamente',
    });
  } catch (error) {
    logger.error(`Error al eliminar dominio: ${error.message}`);
    next(error);
  }
};
