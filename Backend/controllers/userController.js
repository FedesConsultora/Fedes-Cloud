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
 * Función para generar una contraseña segura para el shopper.
 */
const generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('hex'); // Genera una contraseña de 32 caracteres hexadecimales
};

/**
 * Registro de un nuevo usuario por Administrador.
 */
export const createUser = async (req, res, next) => {
  const transaction = await Usuario.sequelize.transaction(); // Iniciar una transacción
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      fechaNacimiento,
      id_rol,
      id_autenticacion,
      clientURI, // Asegúrate de que se envíe clientURI en el cuerpo de la solicitud
    } = req.body;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para crear usuario: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email }, transaction });
    if (existingUser) {
      logger.warn(`Creación de usuario fallida: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    // Encriptar la contraseña
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Verificar el rol
    const userRole = await Rol.findByPk(id_rol, { transaction });
    if (!userRole) {
      logger.error(`Rol especificado no encontrado: ID ${id_rol}`);
      throw new ValidationError([{ msg: 'Rol especificado no válido.', param: 'id_rol', location: 'body' }]);
    }

    // Formatear la fecha de nacimiento si se proporciona
    const [day, month, year] = fechaNacimiento ? fechaNacimiento.split('/') : [null, null, null];
    const formattedDate = day && month && year ? `${year}-${month}-${day}` : null;

    // Crear el usuario en la base de datos
    const newUser = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNacimiento: formattedDate,
      id_rol,
      id_estado: 1, // Estado activo por defecto
      preferenciasNotificaciones: true,
      id_autenticacion,
    }, { transaction });

    // Si el rol es Externo, crear shopperId
    if (userRole.nombre === 'Externo') {
      const shopperData = {
        email,
        externalId: newUser.id_usuario.toString(),
        marketId: 'en-US', // Ajusta según tu mercado objetivo
        nameFirst: nombre,
        nameLast: apellido,
        password: generateSecurePassword(),
      };

      // Crear la subcuenta de shopper en GoDaddy
      const createShopperResponse = await godaddyService.createShopper(shopperData);
      const { shopperId } = createShopperResponse;

      // Asignar el shopperId al usuario
      newUser.shopperId = shopperId;
      await newUser.save({ transaction });
    }

    // Enviar el correo de confirmación si es necesario
    if (clientURI) {
      const emailToken = crypto.randomBytes(32).toString('hex');
      const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

      newUser.emailToken = emailToken;
      newUser.emailTokenExpires = emailTokenExpires;
      newUser.emailConfirmed = false;
      await newUser.save({ transaction });

      const confirmURL = `${clientURI}/auth/confirm-email?token=${emailToken}&email=${newUser.email}`;

      await sendEmail({
        to: newUser.email,
        subject: 'Confirma tu correo electrónico',
        template: 'confirmEmail',
        context: {
          nombre: newUser.nombre,
          confirmURL,
        },
      });
    }

    logger.info(`Usuario creado exitosamente: ID ${newUser.id_usuario}`);

    await transaction.commit(); // Confirmar la transacción

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente.',
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
        shopperId: newUser.shopperId,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
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
  const transaction = await Usuario.sequelize.transaction(); // Iniciar una transacción
  try {
    const { id } = req.params;

    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('manage_users')) {
      logger.warn(`Permiso denegado para eliminar usuario ID ${id}: ID del usuario solicitante ${req.user ? req.user.id : 'Desconocido'}`);
      throw new PermissionDeniedError();
    }

    const user = await Usuario.findByPk(id, { transaction });
    if (!user) {
      logger.warn(`Usuario no encontrado para eliminar: ID ${id}`);
      throw new UserNotFoundError();
    }

    // Si el usuario tiene un shopperId, eliminar la subcuenta en GoDaddy
    if (user.shopperId) {
      // Obtener la IP del cliente para auditClientIp
      const auditClientIp = req.ip || req.connection.remoteAddress;

      await godaddyService.deleteShopper(user.shopperId, auditClientIp);
      logger.info(`Subcuenta de shopper eliminada: SHOPPER_ID ${user.shopperId}`);
    }

    await user.destroy({ transaction });

    logger.info(`Usuario eliminado exitosamente: ID ${id} por el usuario ID ${req.user.id}`);

    await transaction.commit(); // Confirmar la transacción

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: { id },
    });
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
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

/**
 * Actualizar la contraseña del usuario autenticado.
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id_usuario } = req.user;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Verificar que se proporcione la password actual y la nueva password
    if (!currentPassword || !newPassword) {
      throw new ValidationError([
        {
          msg: 'La password actual es obligatoria.',
          param: 'currentPassword',
          location: 'body',
        },
        {
          msg: 'La nueva password es obligatoria.',
          param: 'newPassword',
          location: 'body',
        },
      ]);
    }

    // Verificar que la password actual es correcta
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ValidationError([{
        msg: 'La password actual es incorrecta.',
        param: 'currentPassword',
        location: 'body',
      }]);
    }

    // Encriptar la nueva password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la password
    user.password = hashedPassword;
    await user.save();

    logger.info(`Password actualizada exitosamente para el usuario ID ${id_usuario}`);

    res.status(200).json({
      success: true,
      message: 'Password actualizada exitosamente.',
    });
  } catch (error) {
    logger.error(`Error al actualizar password: ${error.message}`);
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