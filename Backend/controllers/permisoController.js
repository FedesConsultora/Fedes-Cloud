// controllers/permisoController.js
import { Permiso, Rol } from '../models/index.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';

/**
 * Obtener todos los permisos con sus roles asociados.
 */
export const getPermisos = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_permissions')) {
      logger.warn(`Permiso denegado para obtener permisos: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const permisos = await Permiso.findAll({
      include: [
        {
          model: Rol,
          as: 'roles', // Asegúrate de que el alias coincide con el definido en el modelo Permiso
          through: { attributes: [] }, // Excluir atributos de la tabla intermedia
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Permisos obtenidos exitosamente',
      data: permisos,
    });
  } catch (error) {
    logger.error(`Error al obtener permisos: ${error.message}`);
    next(error);
  }
};

/**
 * Crear un nuevo permiso.
 */
export const createPermiso = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !descripcion) {
      throw new ValidationError('El nombre y la descripción del permiso son obligatorios');
    }

    const existingPermiso = await Permiso.findOne({ where: { nombre } });
    if (existingPermiso) {
      throw new ValidationError(`El permiso '${nombre}' ya existe`);
    }

    const newPermiso = await Permiso.create({ nombre, descripcion });

    logger.info(`Permiso creado exitosamente: ID ${newPermiso.id_permiso}, Nombre: ${newPermiso.nombre}`);

    res.status(201).json({
      success: true,
      message: 'Permiso creado exitosamente',
      data: newPermiso,
    });
  } catch (error) {
    logger.error(`Error al crear permiso: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un permiso por su ID.
 */
export const getPermisoById = async (req, res, next) => {
  try {
    const { id_permiso } = req.params;

    if (!req.user || !req.user.permisos.includes('manage_permissions')) {
      logger.warn(`Permiso denegado para obtener permiso: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const permiso = await Permiso.findByPk(id_permiso, {
      include: [
        {
          model: Rol,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
    });

    if (!permiso) {
      throw new ValidationError(`El permiso con ID ${id_permiso} no existe`);
    }

    res.status(200).json({
      success: true,
      message: 'Permiso obtenido exitosamente',
      data: permiso,
    });
  } catch (error) {
    logger.error(`Error al obtener permiso: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un permiso existente.
 */
export const updatePermiso = async (req, res, next) => {
  try {
    const { id_permiso } = req.params;
    const { nombre, descripcion } = req.body;

    if (!req.user || !req.user.permisos.includes('manage_permissions')) {
      logger.warn(`Permiso denegado para actualizar permiso: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const permiso = await Permiso.findByPk(id_permiso);
    if (!permiso) {
      throw new ValidationError(`El permiso con ID ${id_permiso} no existe`);
    }

    if (nombre) permiso.nombre = nombre;
    if (descripcion) permiso.descripcion = descripcion;

    await permiso.save();

    logger.info(`Permiso actualizado exitosamente: ID ${permiso.id_permiso}, Nombre: ${permiso.nombre}`);

    res.status(200).json({
      success: true,
      message: 'Permiso actualizado exitosamente',
      data: permiso,
    });
  } catch (error) {
    logger.error(`Error al actualizar permiso: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un permiso.
 */
export const deletePermiso = async (req, res, next) => {
  try {
    const { id_permiso } = req.params;

    if (!req.user || !req.user.permisos.includes('manage_permissions')) {
      logger.warn(`Permiso denegado para eliminar permiso: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const permiso = await Permiso.findByPk(id_permiso);
    if (!permiso) {
      throw new ValidationError(`El permiso con ID ${id_permiso} no existe`);
    }

    await permiso.destroy();

    logger.info(`Permiso eliminado exitosamente: ID ${id_permiso}`);

    res.status(200).json({
      success: true,
      message: 'Permiso eliminado exitosamente',
    });
  } catch (error) {
    logger.error(`Error al eliminar permiso: ${error.message}`);
    next(error);
  }
};