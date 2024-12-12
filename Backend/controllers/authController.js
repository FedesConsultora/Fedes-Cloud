// controllers/authController.js

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';
import {
  EmailAlreadyExistsError,
} from '../utils/errors/UserErrors.js';
import { ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import { Usuario, Rol } from '../models/index.js';
import { sendEmail } from '../utils/emailService.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const register = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      fechaNacimiento,
      clientURI,
    } = req.body;

    const id_autenticacion = 1; // Local

    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registro fallido: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await Rol.findOne({ where: { nombre: 'Externo' } });
    if (!defaultRole) {
      logger.error(`Rol predeterminado 'Externo' no encontrado`);
      throw new Error('Rol predeterminado no configurado');
    }

    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const [day, month, year] = fechaNacimiento.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const newUser = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNacimiento: formattedDate,
      id_rol: defaultRole.id_rol,
      id_estado: 1,
      preferenciasNotificaciones: true,
      id_autenticacion,
      emailToken,
      emailTokenExpires,
      emailConfirmed: false,
    });

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

    logger.info(`Usuario registrado exitosamente: ID ${newUser.id_usuario}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.',
    });
  } catch (error) {
    logger.error(`Error en registro de usuario: ${error.message}`);
    next(error);
  }
};

export const confirmEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    logger.info(`Intentando confirmar email: ${email} con token: ${token}`);

    const user = await Usuario.findOne({ where: { email, emailToken: token } });

    if (!user) {
      throw new ValidationError([{
        msg: 'Token inválido o expirado.',
        param: 'email',
        location: 'query',
      }]);
    }

    if (user.emailTokenExpires < Date.now()) {
      throw new ValidationError([{
        msg: 'El token ha expirado. Por favor, solicita un nuevo correo de confirmación.',
        param: 'email',
        location: 'query',
      }]);
    }

    if (user.emailConfirmed) {
      throw new ValidationError([{
        msg: 'El correo electrónico ya está confirmado.',
        param: 'email',
        location: 'query',
      }]);
    }

    user.emailConfirmed = true;
    user.emailToken = null;
    user.emailTokenExpires = null;

    await user.save();

    logger.info(`Correo electrónico confirmado para ${email}`);

    res.status(200).json({
      success: true,
      message: 'Correo electrónico confirmado exitosamente',
    });
  } catch (error) {
    logger.error(`Error en confirmación de correo: ${error.message}`);
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email, clientURI } = req.body;

    if (!clientURI) {
      throw new ValidationError([{
        msg: 'El clientURI es obligatorio.',
        param: 'clientURI',
        location: 'body',
      }]);
    }

    const allowedClientURIs = [
      'http://localhost:3000',
      'https://tudominio.com',
    ];

    if (!allowedClientURIs.includes(clientURI)) {
      throw new ValidationError([{
        msg: 'clientURI no está permitido.',
        param: 'clientURI',
        location: 'body',
      }]);
    }

    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      logger.warn(`Solicitud reset: usuario ${email} no encontrado`);
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace para restablecer la contraseña.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1h

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetURL = `${clientURI}/auth/reset-password?token=${resetToken}&email=${user.email}`;

    await sendEmail({
      to: user.email,
      subject: 'Restablecimiento de Contraseña',
      template: 'resetPassword',
      context: {
        nombre: user.nombre,
        resetURL,
      },
    });

    logger.info(`Solicitud de restablecimiento enviada a ${email}`);

    res.status(200).json({
      success: true,
      message: 'Si el correo existe, se enviará un enlace para restablecer la contraseña.',
    });
  } catch (error) {
    logger.error(`Error en solicitud de restablecimiento: ${error.message}`);
    next(error);
  }
};

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
      throw new ValidationError([{
        msg: 'Token inválido o expirado',
        param: 'token',
        location: 'body',
      }]);
    }

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

export const resendConfirmEmail = async (req, res, next) => {
  try {
    const { email, clientURI } = req.body;

    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace para confirmar tu cuenta.',
      });
    }

    if (user.emailConfirmed) {
      return res.status(200).json({
        success: true,
        message: 'Tu correo ya está confirmado. Puedes iniciar sesión.',
      });
    }

    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    user.emailToken = emailToken;
    user.emailTokenExpires = emailTokenExpires;
    await user.save();

    const confirmURL = `${clientURI}/auth/confirm-email?token=${emailToken}&email=${user.email}`;
    await sendEmail({
      to: user.email,
      subject: 'Confirma tu correo electrónico',
      template: 'confirmEmail',
      context: { nombre: user.nombre, confirmURL },
    });

    res.status(200).json({
      success: true,
      message: 'Si el correo existe, se enviará un enlace para confirmar tu cuenta.',
    });
  } catch (error) {
    logger.error(`Error al reenviar confirmación: ${error.message}`);
    next(error);
  }
};

export const resendPasswordReset = async (req, res, next) => {
  try {
    const { email, clientURI } = req.body;

    if (!email || !clientURI) {
      throw new ValidationError([
        {
          msg: 'El email es obligatorio.',
          param: 'email',
          location: 'body',
        },
        {
          msg: 'El clientURI es obligatorio.',
          param: 'clientURI',
          location: 'body',
        },
      ]);
    }

    const allowedClientURIs = [
      'http://localhost:3000',
      'https://tudominio.com',
    ];

    if (!allowedClientURIs.includes(clientURI)) {
      throw new ValidationError([{
        msg: 'clientURI no está permitido.',
        param: 'clientURI',
        location: 'body',
      }]);
    }

    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace para restablecer tu contraseña.',
      });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
      return res.status(429).json({
        success: false,
        message: 'Ya has solicitado un restablecimiento recientemente. Espera antes de intentar nuevamente.',
        errors: [],
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetURL = `${clientURI}/auth/reset-password?token=${resetToken}&email=${user.email}`;
    await sendEmail({
      to: user.email,
      subject: 'Restablecimiento de Contraseña',
      template: 'resetPassword',
      context: { nombre: user.nombre, resetURL },
    });

    res.status(200).json({
      success: true,
      message: 'Si el correo existe, se enviará un enlace para restablecer tu contraseña.',
    });
  } catch (error) {
    logger.error(`Error al reenviar restablecimiento: ${error.message}`);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
    res.status(200).json({
      success: true,
      message: 'Cierre de sesión exitoso',
    });
  } catch (error) {
    logger.error(`Error en logout: ${error.message}`);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id_usuario } = req.user;
    const user = await Usuario.findOne({
      where: { id_usuario },
      attributes: { exclude: ['password', 'emailToken', 'emailTokenExpires', 'resetPasswordToken', 'resetPasswordExpires', 'twoFactorSecret'] },
    });

    if (!user) {
      throw new ValidationError([{
        msg: 'Usuario no encontrado.',
        param: 'user',
        location: 'database',
      }]);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    logger.error(`Error al obtener perfil: ${error.message}`);
    next(error);
  }
};

export const enableTwoFactor = async (req, res, next) => {
  try {
    console.log('entre')
    const user = await Usuario.findByPk(req.user.id_usuario);

    if (!user) {
      throw new ValidationError([{
        msg: 'Usuario no encontrado',
        param: 'user',
        location: 'database',
      }]);
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'La autenticación de dos factores ya está habilitada.',
      });
    }

    const secret = speakeasy.generateSecret({
      name: `TuApp (${user.email})`,
      length: 20,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: 'Secret generado. Escanea el QR con tu app de autenticación.',
      data: {
        qrCodeDataURL,
        secret: secret.base32,
      },
    });
  } catch (error) {
    logger.error(`Error al habilitar 2FA: ${error.message}`);
    next(error);
  }
};

export const verifyTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError([{
        msg: 'El token de 2FA es obligatorio.',
        param: 'token',
        location: 'body',
      }]);
    }

    const user = await Usuario.findByPk(req.user.id_usuario);

    if (!user || !user.twoFactorSecret) {
      throw new ValidationError([{
        msg: 'Usuario no encontrado o 2FA no configurado.',
        param: 'user',
        location: 'body',
      }]);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new ValidationError([{
        msg: 'Token de 2FA inválido.',
        param: 'token',
        location: 'body',
      }]);
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Autenticación de dos factores habilitada exitosamente.',
    });
  } catch (error) {
    logger.error(`Error al verificar 2FA: ${error.message}`);
    next(error);
  }
};

export const disableTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError([{
        msg: 'El token de 2FA es obligatorio para deshabilitar.',
        param: 'token',
        location: 'body',
      }]);
    }

    const user = await Usuario.findByPk(req.user.id_usuario);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new ValidationError([{
        msg: '2FA no está habilitado para este usuario.',
        param: 'user',
        location: 'body',
      }]);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new ValidationError([{
        msg: 'Token de 2FA inválido.',
        param: 'token',
        location: 'body',
      }]);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Autenticación de dos factores deshabilitada exitosamente.',
    });
  } catch (error) {
    logger.error(`Error al deshabilitar 2FA: ${error.message}`);
    next(error);
  }
};
