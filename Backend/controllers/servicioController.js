import { Servicio, Dominio, Certificado, DNS } from '../models/index.js';
import { PermissionDeniedError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';

/**
 * Crear un nuevo servicio.
 */
export const createService = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para crear servicios.');
    }

    const { nombre, estado, idUsuario } = req.body;

    const newService = await Servicio.create({
      nombre,
      estado,
      id_usuario: idUsuario,
    });

    logger.info(`Servicio creado exitosamente: ${newService.id_servicio}`);
    res.status(201).json({
      success: true,
      data: newService,
    });
  } catch (error) {
    logger.error(`Error al crear servicio: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener todos los servicios.
 */
export const getServices = async (req, res, next) => {
  try {
    console.log(req.user);
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver servicios.');
    }

    const services = await Servicio.findAll({
      include: [Dominio, Certificado, DNS],
    });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    logger.error(`Error al obtener servicios: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un servicio por ID.
 */
export const getServiceById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver este servicio.');
    }

    const { id } = req.params;

    const service = await Servicio.findByPk(id, {
      include: [Dominio, Certificado, DNS],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    logger.error(`Error al obtener servicio: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un servicio.
 */
export const updateService = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('update_services')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar servicios.');
    }

    const { id } = req.params;
    const { nombre, estado } = req.body;

    const service = await Servicio.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    service.nombre = nombre || service.nombre;
    service.estado = estado || service.estado;

    await service.save();

    logger.info(`Servicio actualizado: ${id}`);
    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    logger.error(`Error al actualizar servicio: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un servicio.
 */
export const deleteService = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('delete_services')) {
      throw new PermissionDeniedError('No tienes permiso para eliminar servicios.');
    }

    const { id } = req.params;

    const service = await Servicio.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    await service.destroy();

    logger.info(`Servicio eliminado: ${id}`);
    res.status(200).json({
      success: true,
      message: 'Servicio eliminado exitosamente.',
    });
  } catch (error) {
    logger.error(`Error al eliminar servicio: ${error.message}`);
    next(error);
  }
};