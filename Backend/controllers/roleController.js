// controllers/roleController.js
import { Rol, Permiso } from '../models/index.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';

// Obtener todos los roles con sus permisos
export const getRoles = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_roles')) {
      logger.warn(`Permiso denegado para obtener roles: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const roles = await Rol.findAll({
      include: [
        {
          model: Permiso,
          as: 'permisos', // Asegúrate de que el alias coincide con el definido en el modelo
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles,
    });
  } catch (error) {
    logger.error(`Error al obtener roles: ${error.message}`);
    next(error);
  }
};

// Crear un nuevo rol
export const createRole = async (req, res, next) => {
  try {
    const { nombre, permisos } = req.body;

    if (!nombre) {
      throw new ValidationError('El nombre del rol es obligatorio');
    }

    const existingRole = await Rol.findOne({ where: { nombre } });
    if (existingRole) {
      throw new ValidationError(`El rol '${nombre}' ya existe`);
    }

    const newRole = await Rol.create({ nombre });

    if (permisos && Array.isArray(permisos)) {
      const permisosEncontrados = await Permiso.findAll({
        where: { nombre: permisos },
      });

      if (permisosEncontrados.length !== permisos.length) {
        throw new ValidationError('Algunos permisos proporcionados no existen');
      }

      await newRole.addPermisos(permisosEncontrados);
    }

    logger.info(`Rol creado exitosamente: ID ${newRole.id_rol}, Nombre: ${newRole.nombre}`);

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: newRole,
    });
  } catch (error) {
    logger.error(`Error al crear rol: ${error.message}`);
    next(error);
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.permisos.includes('manage_roles')) {
      logger.warn(`Permiso denegado para obtener rol: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const role = await Rol.findByPk(id, {
      include: [
        {
          model: Permiso,
          as: 'permisos',
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      throw new ValidationError(`El rol con ID ${id} no existe`);
    }

    res.status(200).json({
      success: true,
      message: 'Rol obtenido exitosamente',
      data: role,
    });
  } catch (error) {
    logger.error(`Error al obtener rol: ${error.message}`);
    next(error);
  }
};

// Actualizar un rol existente
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, permisos } = req.body;

    if (!req.user || !req.user.permisos.includes('manage_roles')) {
      logger.warn(`Permiso denegado para actualizar rol: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const role = await Rol.findByPk(id);
    if (!role) {
      throw new ValidationError(`El rol con ID ${id} no existe`);
    }

    if (nombre) {
      role.nombre = nombre;
      await role.save();
    }

    if (permisos && Array.isArray(permisos)) {
      const permisosEncontrados = await Permiso.findAll({
        where: { nombre: permisos },
      });

      if (permisosEncontrados.length !== permisos.length) {
        throw new ValidationError('Algunos permisos proporcionados no existen');
      }

      await role.setPermisos(permisosEncontrados);
    }

    logger.info(`Rol actualizado exitosamente: ID ${role.id_rol}, Nombre: ${role.nombre}`);

    res.status(200).json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: role,
    });
  } catch (error) {
    logger.error(`Error al actualizar rol: ${error.message}`);
    next(error);
  }
};

// Eliminar un rol
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.permisos.includes('manage_roles')) {
      logger.warn(`Permiso denegado para eliminar rol: Usuario ID ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const role = await Rol.findByPk(id);
    if (!role) {
      throw new ValidationError(`El rol con ID ${id} no existe`);
    }

    await role.destroy();

    logger.info(`Rol eliminado exitosamente: ID ${id}`);

    res.status(200).json({
      success: true,
      message: 'Rol eliminado exitosamente',
    });
  } catch (error) {
    logger.error(`Error al eliminar rol: ${error.message}`);
    next(error);
  }
};