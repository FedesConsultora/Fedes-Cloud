// controllers/userController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
      contraseña,
      fechaNacimiento,
      id_rol,
      id_autenticacion,
    } = req.body;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('create_user')) {
      throw new PermissionDeniedError();
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Creación de usuario fallida: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const newUser = await Usuario.create({
      nombre,
      apellido,
      email,
      contraseña: hashedPassword,
      fechaNacimiento,
      id_rol,
      id_estado: 1, // Estado activo por defecto
      preferenciasNotificaciones: true,
      id_autenticacion,
    });

    logger.info(`Usuario creado: ID ${newUser.id_usuario}`);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser,
    });
  } catch (error) {
    logger.error(`Error al crear usuario: ${error.message}`);
    next(error);
  }
};

/**
 * Inicio de sesión de usuario.
 */
export const login = async (req, res, next) => {
  try {
    const { email, contraseña } = req.body;

    // Buscar al usuario por email
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login fallido: Usuario con email ${email} no encontrado`);
      throw new InvalidCredentialsError(); // Respuesta genérica por seguridad
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      logger.warn(`Login fallido: Contraseña inválida para el email ${email}`);
      throw new InvalidCredentialsError();
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        id_rol: user.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // El token expirará en 1 hora
    );

    logger.info(`Usuario ${user.id_usuario} inició sesión exitosamente`);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: { token },
    });
  } catch (error) {
    logger.error(`Error en login: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener todos los usuarios.
 */
export const getUsers = async (req, res, next) => {
  try {
    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('view_users')) {
      throw new PermissionDeniedError();
    }

    const users = await Usuario.findAll({
      include: [Rol, Estado, Autenticacion],
    });

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
    if (!req.user || !req.user.permisos.includes('view_user')) {
      throw new PermissionDeniedError();
    }

    const user = await Usuario.findByPk(id, {
      include: [Rol, Estado, Autenticacion],
    });

    if (!user) {
      logger.warn(`Usuario no encontrado: ID ${id}`);
      throw new UserNotFoundError();
    }

    res.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: user,
    });
  } catch (error) {
    logger.error(`Error al obtener usuario por ID: ${error.message}`);
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
    } = req.body;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('update_user')) {
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

    await user.update({
      nombre,
      apellido,
      email,
      fechaNacimiento,
      preferenciasNotificaciones,
      id_rol,
      id_estado,
      id_autenticacion,
    });

    logger.info(`Usuario actualizado: ID ${user.id_usuario}`);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user,
    });
  } catch (error) {
    logger.error(`Error al actualizar usuario: ${error.message}`);
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
    if (!req.user || !req.user.permisos.includes('delete_user')) {
      throw new PermissionDeniedError();
    }

    const user = await Usuario.findByPk(id);
    if (!user) {
      logger.warn(`Usuario no encontrado para eliminar: ID ${id}`);
      throw new UserNotFoundError();
    }

    await user.destroy();

    logger.info(`Usuario eliminado: ID ${user.id_usuario}`);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: { id: user.id_usuario },
    });
  } catch (error) {
    logger.error(`Error al eliminar usuario: ${error.message}`);
    next(error);
  }
};