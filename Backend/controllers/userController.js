// controllers/userController.js
import bcrypt from 'bcrypt';
import { Usuario, Rol, Estado, Autenticacion } from '../models/index.js';
import {
  UserNotFoundError,
  InvalidCredentialsError,
  EmailAlreadyExistsError,
} from '../utils/errors/UserErrors.js';
import { PermissionDeniedError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';

/**
 * Registro de un nuevo usuario.
 */
export const createUser = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      fechaNacimiento,
      id_rol,
      id_autenticacion,
    } = req.body;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para crear usuario: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Creación de usuario fallida: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNacimiento,
      id_rol,
      id_estado: 1, // Estado activo por defecto
      preferenciasNotificaciones: true,
      id_autenticacion,
    });

    logger.info(`Usuario creado exitosamente: ID ${newUser.id_usuario}`);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id_usuario: newUser.id_usuario,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        fechaNacimiento: newUser.fechaNacimiento,
        id_rol: newUser.id_rol,
        id_estado: newUser.id_estado,
        preferenciasNotificaciones: newUser.preferenciasNotificaciones,
        id_autenticacion: newUser.id_autenticacion,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Error al crear usuario: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener todos los usuarios.
 */
export const getUsers = async (req, res, next) => {
  try {
    // Verificar permisos
    logger.debug(`Verificando permisos para obtener usuarios: ${JSON.stringify(req.user)}`);
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para obtener usuarios: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const users = await Usuario.findAll({
      include: [Rol, Estado, Autenticacion],
      attributes: { exclude: ['contraseña'] }, // Excluir la contraseña de la respuesta
    });

    logger.info(`Usuarios obtenidos exitosamente por el usuario ID ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: users,
    });
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un usuario por ID.
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para obtener usuario ID ${id}: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const user = await Usuario.findByPk(id, {
      include: [Rol, Estado, Autenticacion],
      attributes: { exclude: ['contraseña'] }, // Excluir la contraseña de la respuesta
    });

    if (!user) {
      logger.warn(`Usuario no encontrado: ID ${id}`);
      throw new UserNotFoundError();
    }

    logger.info(`Usuario ID ${id} obtenido exitosamente por el usuario ID ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: user,
    });
  } catch (error) {
    logger.error(`Error al obtener usuario por ID ${req.params.id}: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un usuario.
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      fechaNacimiento,
      preferenciasNotificaciones,
      id_rol,
      id_estado,
      id_autenticacion,
      contraseña, // Asegúrate de permitir actualizar la contraseña si es necesario
    } = req.body;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para actualizar usuario ID ${id}: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const user = await Usuario.findByPk(id);
    if (!user) {
      logger.warn(`Usuario no encontrado para actualizar: ID ${id}`);
      throw new UserNotFoundError();
    }

    // Si el email está siendo actualizado, verificar si ya existe
    if (email && email !== user.email) {
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        logger.warn(`Actualización de usuario fallida: Email ${email} ya está registrado`);
        throw new EmailAlreadyExistsError();
      }
    }

    // Encriptar la nueva contraseña si se proporciona
    let hashedPassword = user.contraseña;
    if (contraseña) {
      hashedPassword = await bcrypt.hash(contraseña, 10);
    }

    await user.update({
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      email: email || user.email,
      contraseña: hashedPassword,
      fechaNacimiento: fechaNacimiento || user.fechaNacimiento,
      preferenciasNotificaciones: preferenciasNotificaciones !== undefined ? preferenciasNotificaciones : user.preferenciasNotificaciones,
      id_rol: id_rol || user.id_rol,
      id_estado: id_estado || user.id_estado,
      id_autenticacion: id_autenticacion || user.id_autenticacion,
    });

    logger.info(`Usuario actualizado exitosamente: ID ${user.id_usuario} por el usuario ID ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        fechaNacimiento: user.fechaNacimiento,
        id_rol: user.id_rol,
        id_estado: user.id_estado,
        preferenciasNotificaciones: user.preferenciasNotificaciones,
        id_autenticacion: user.id_autenticacion,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Error al actualizar usuario ID ${req.params.id}: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un usuario.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para eliminar usuario ID ${id}: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const user = await Usuario.findByPk(id);
    if (!user) {
      logger.warn(`Usuario no encontrado para eliminar: ID ${id}`);
      throw new UserNotFoundError();
    }

    await user.destroy();

    logger.info(`Usuario eliminado exitosamente: ID ${id} por el usuario ID ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: { id },
    });
  } catch (error) {
    logger.error(`Error al eliminar usuario ID ${req.params.id}: ${error.message}`);
    next(error);
  }
};