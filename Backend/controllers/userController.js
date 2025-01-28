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
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';

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
      include: [
        { model: Rol, as: 'rol' },
        { model: Estado, as: 'estado' },
        { model: Autenticacion, as: 'autenticacion' },
      ],
      attributes: { exclude: ['password'] }, 
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
      include: [
        { model: Rol, as: 'rol' },
        { model: Estado, as: 'estado' },
        { model: Autenticacion, as: 'autenticacion' },
      ],
      attributes: { exclude: ['password'] }, 
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
      password,
      clientURI,
    } = req.body;
    
    logger.debug(`Actualizando usuario ID ${id} con los siguientes datos: ${JSON.stringify(req.body)}`);

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

    // Inicializar objeto con los campos a actualizar
    const updateFields = {
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      fechaNacimiento: fechaNacimiento || user.fechaNacimiento,
      preferenciasNotificaciones: preferenciasNotificaciones !== undefined ? preferenciasNotificaciones : user.preferenciasNotificaciones,
      id_rol: id_rol || user.id_rol,
      id_estado: id_estado || user.id_estado,
      id_autenticacion: id_autenticacion || user.id_autenticacion,
    };

    logger.debug(`Campos a actualizar: ${JSON.stringify(updateFields)}`);

    // Manejar actualización de contraseña si se proporciona
    if (password) {
      logger.debug(`Hashing nueva contraseña para usuario ID ${id}`);
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
      logger.debug(`Contraseña encriptada: ${hashedPassword}`);
    }

    // Manejar actualización de email si se proporciona y es diferente al actual
    if (email && email !== user.email) {
      logger.debug(`Actualizando email para usuario ID ${id}`);
      // Verificar si el nuevo email ya existe
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        logger.warn(`Actualización de usuario fallida: Email ${email} ya está registrado`);
        throw new EmailAlreadyExistsError();
      }

      // Generar token de confirmación de email
      const emailToken = crypto.randomBytes(32).toString('hex');
      const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

      updateFields.email = email;
      updateFields.emailConfirmed = false;
      updateFields.emailToken = emailToken;
      updateFields.emailTokenExpires = emailTokenExpires;

      logger.debug(`Email Token: ${emailToken}, Expira en: ${new Date(emailTokenExpires)}`);

      // Enviar correo de confirmación al nuevo email
      const confirmURL = `${clientURI}/auth/confirm-email?token=${emailToken}&email=${email}`;
      logger.debug(`Enviando correo de confirmación a ${email} con URL: ${confirmURL}`);

      await sendEmail({
        to: email,
        subject: 'Confirma tu nuevo correo electrónico',
        template: 'confirmEmail',
        context: {
          nombre: user.nombre,
          confirmURL,
        },
      });

      logger.info(`Se ha enviado un correo de confirmación a ${email} para actualizar el email del usuario ID ${id}`);
    }

    logger.debug(`Actualizando usuario ID ${id} en la base de datos`);
    await user.update(updateFields);
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
    logger.error(`Error al actualizar usuario ID ${req.params.id}: ${error.message}`, { stack: error.stack });
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

// controllers/userController.js
export const updateProfile = async (req, res, next) => {
  try {
    const { nombre, apellido, avatar } = req.body;
    const { id_usuario } = req.user;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new UserNotFoundError();
    }

    await user.update({
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      avatar: avatar || user.avatar,
    });

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user,
    });
  } catch (error) {
    logger.error(`Error al actualizar perfil: ${error.message}`);
    next(error);
  }
};

export const updateEmail = async (req, res, next) => {
  try {
    const { newEmail, confirmationCode } = req.body;
    const { id_usuario } = req.user;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.emailVerificationCode !== confirmationCode) {
      throw new ValidationError([{ msg: 'Código de verificación incorrecto', param: 'confirmationCode' }]);
    }

    await user.update({ email: newEmail, emailVerified: false });

    res.status(200).json({
      success: true,
      message: 'Correo electrónico actualizado exitosamente',
    });
  } catch (error) {
    logger.error(`Error al actualizar correo electrónico: ${error.message}`);
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id_usuario } = req.user;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new UserNotFoundError();
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new ValidationError([{ msg: 'La contraseña actual es incorrecta', param: 'currentPassword' }]);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    logger.error(`Error al actualizar contraseña: ${error.message}`);
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await Rol.findAll({
      attributes: ['id_rol', 'nombre'],
    });
    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    logger.error(`Error al obtener roles: ${error.message}`);
    next(error);
  }
};

export const getEstados = async (req, res, next) => {
  try {
    const estados = await Estado.findAll({
      attributes: ['id_estado', 'nombre'],
    });
    res.status(200).json({
      success: true,
      data: estados,
    });
  } catch (error) {
    logger.error(`Error al obtener estados: ${error.message}`);
    next(error);
  }
};