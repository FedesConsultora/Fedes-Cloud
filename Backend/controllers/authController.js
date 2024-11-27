// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import {
  InvalidCredentialsError,
  EmailAlreadyExistsError,
} from '../utils/errors/UserErrors.js';
import { ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import { Usuario, Rol } from '../models/index.js';
import { sendEmail } from '../utils/emailService.js';

/**
 * Registrar un nuevo usuario
 */
export const register = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      fechaNacimiento,
      id_autenticacion,
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registro fallido: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar el rol predeterminado (por ejemplo, 'Externo')
    const defaultRole = await Rol.findOne({ where: { nombre: 'Externo' } });
    if (!defaultRole) {
      logger.error(`Rol predeterminado 'Externo' no encontrado en la base de datos`);
      throw new Error('Rol predeterminado no configurado');
    }

    // Generar token de confirmación de correo electrónico
    const emailToken = crypto.randomBytes(32).toString('hex');

    const newUser = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNacimiento,
      id_rol: defaultRole.id_rol,
      id_estado: 1,
      preferenciasNotificaciones: true,
      id_autenticacion,
      emailToken,
      emailConfirmed: false,
    });

    // Enviar correo de confirmación usando plantilla
    const confirmURL = `${process.env.CLIENT_URI}/auth/confirm-email?token=${emailToken}&email=${newUser.email}`;

    await sendEmail({
      to: newUser.email,
      subject: 'Confirma tu correo electrónico',
      template: 'confirmEmail', // Nombre de la plantilla sin extensión
      context: {
        nombre: newUser.nombre,
        confirmURL,
      },
    });

    logger.info(`Usuario registrado exitosamente: ID ${newUser.id_usuario}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico para confirmar tu cuenta.',
    });
  } catch (error) {
    logger.error(`Error en registro de usuario: ${error.message}`);
    next(error);
  }
};

/**
 * Iniciar sesión de usuario
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Email:', email);
    // Buscar al usuario por email
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login fallido: Usuario con email ${email} no encontrado`);
      throw new InvalidCredentialsError(); // Respuesta genérica por seguridad
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.warn(`Login fallido: Contraseña inválida para el email ${email}`);
      throw new InvalidCredentialsError();
    }

    // Verificar si el correo electrónico está confirmado
    if (!user.emailConfirmed) {
      throw new ValidationError('Por favor, confirma tu correo electrónico antes de iniciar sesión.');
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        id_rol: user.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`Usuario ID ${user.id_usuario} inició sesión exitosamente`);

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
 * Confirmar correo electrónico
 */
export const confirmEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    const user = await Usuario.findOne({
      where: {
        email,
        emailToken: token,
      },
    });

    if (!user) {
      throw new ValidationError('Token inválido o expirado');
    }

    user.emailConfirmed = true;
    user.emailToken = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Correo electrónico confirmado exitosamente',
    });
  } catch (error) {
    logger.error(`Error en confirmación de correo: ${error.message}`);
    next(error);
  }
};

/**
 * Solicitar restablecimiento de contraseña
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      logger.warn(`Solicitud de restablecimiento: Usuario con email ${email} no encontrado`);
      // Respuesta genérica por seguridad
      return res.status(200).json({
        success: true,
        message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      });
    }

    // Generar token de restablecimiento de contraseña
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    // Enviar correo de restablecimiento usando plantilla
    const resetURL = `${process.env.CLIENT_URI}/auth/reset-password?token=${resetToken}&email=${user.email}`;

    await sendEmail({
      to: user.email,
      subject: 'Restablecimiento de Contraseña',
      template: 'resetPassword', // Nombre de la plantilla sin extensión
      context: {
        nombre: user.nombre,
        resetURL,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
    });
  } catch (error) {
    logger.error(`Error en solicitud de restablecimiento de contraseña: ${error.message}`);
    next(error);
  }
};

/**
 * Restablecer contraseña
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await Usuario.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      throw new ValidationError('Token inválido o expirado');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    logger.error(`Error en restablecimiento de contraseña: ${error.message}`);
    next(error);
  }
};