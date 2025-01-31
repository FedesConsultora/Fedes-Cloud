// controllers/authController.js

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { EmailAlreadyExistsError } from '../utils/errors/UserErrors.js';
import { ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import { Usuario, Rol } from '../models/index.js';
import { sendEmail } from '../utils/emailService.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import passport, { generateJWT } from '../config/passport.js';
import goDaddyService from '../factories/godaddyServiceFactory.js';
import fs from 'fs';
import path from 'path';

/**
 * Función para generar una contraseña segura para el shopper.
 */
const generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('hex'); // Genera una contraseña de 32 caracteres hexadecimales
};

/**
 * Función para iniciar sesión y asignar shopperId si es necesario.
 */
export const login = async (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        logger.error(`Error durante la autenticación: ${err.message}`);
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: info?.message || 'Credenciales inválidas' });
      }
      
      // Asignar shopperId si el usuario es Externo y shopperId es null
      const externoRole = await Rol.findOne({ where: { nombre: 'Externo' } });
      
      if (user.id_rol === externoRole.id_rol && !user.shopperId) {
        try {
          const shopperData = {
            email: user.email,
            externalId: user.id_usuario,
            marketId: 'en-US', // Ajusta según tu mercado objetivo
            nameFirst: user.nombre,
            nameLast: user.apellido,
            password: crypto.randomBytes(16).toString('hex'), // Contraseña segura
          };

          // Crear shopper en GoDaddy
          const createShopperResponse = await goDaddyService.createShopper(shopperData);
          const { shopperId } = createShopperResponse;

          // Asignar shopperId al usuario
          user.shopperId = shopperId;
          await user.save();

          logger.info(`ShopperId asignado a usuario ${user.email}: ${shopperId}`);
        } catch (shopperError) {
          logger.error(`Error asignando shopperId a usuario ${user.email}: ${shopperError.message}`);
          // Opcional: Puedes decidir si fallar el inicio de sesión aquí o continuar sin shopperId
          // return next(shopperError);
        }
      }

      if (user.twoFactorEnabled) {
        const tempToken = crypto.randomBytes(32).toString('hex');
        const tempTokenExpires = Date.now() + (10 * 60 * 1000); // 10 minutos
        user.twoFactorTempToken = tempToken;
        user.twoFactorTempExpires = tempTokenExpires;
        await user.save();

        return res.status(200).json({
          success: true,
          message: 'Se requiere autenticación de dos factores.',
          twoFactorRequired: true,
          tempToken,
        });
      } else {
        const token = generateJWT(user);
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'None' : 'Lax',
          maxAge: 60 * 60 * 1000, // 1 hora
        };
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
          success: true,
          message: 'Inicio de sesión exitoso',
          twoFactorEnabled: user.twoFactorEnabled,
          token: token,
        });
      }
    } catch (error) {
      logger.error(`Error en el controlador de login: ${error.message}`);
      next(error);
    }
  })(req, res, next);
};

export const loginTwoFactor = async (req, res, next) => {
  try {
    const { tempToken, twoFactorToken } = req.body;
    if (!tempToken || !twoFactorToken) {
      return res.status(400).json({ success: false, message: 'Token temporal y código de 2FA son obligatorios.' });
    }

    const user = await Usuario.findOne({
      where: {
        twoFactorTempToken: tempToken,
        twoFactorTempExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token temporal inválido o expirado.' });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA no está habilitada para este usuario.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 1,
    });

    if (verified) {
      user.twoFactorTempToken = null;
      user.twoFactorTempExpires = null;
      await user.save();

      const token = generateJWT(user);
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000,
      };
      res.cookie('token', token, cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso con 2FA.',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Código de 2FA inválido.' });
    }
  } catch (error) {
    logger.error(`Error en verificación de 2FA: ${error.message}`);
    next(error);
  }
};

export const register = async (req, res, next) => {
  const transaction = await Usuario.sequelize.transaction(); // Iniciar una transacción
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

    const existingUser = await Usuario.findOne({ where: { email }, transaction });
    if (existingUser) {
      logger.warn(`Registro fallido: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await Rol.findOne({ where: { nombre: 'Externo' }, transaction });
    if (!defaultRole) {
      logger.error(`Rol predeterminado 'Externo' no encontrado`);
      throw new Error('Rol predeterminado no configurado');
    }

    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const [day, month, year] = fechaNacimiento.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    // Crear el usuario en la base de datos
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
    }, { transaction });
    /*
    // Si el rol es Externo, crear shopperId
    if (defaultRole.nombre === 'Externo') {
      const shopperData = {
        email,
        externalId: newUser.id_usuario,
        marketId: 'en-US', // Ajusta según tu mercado objetivo
        nameFirst: nombre,
        nameLast: apellido,
        password: generateSecurePassword(),
      };

      // Crear la subcuenta de shopper en GoDaddy
      const createShopperResponse = await goDaddyService.createShopper(shopperData);
      const { shopperId } = createShopperResponse;

      // Asignar el shopperId al usuario
      newUser.shopperId = shopperId;
      await newUser.save({ transaction });
    }
    */
    // Enviar el correo de confirmación
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

    await transaction.commit(); // Confirmar la transacción

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.',
    });
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
    logger.error(`Error en registro de usuario: ${error.message}`);
    next(error);
  }
};

/**
 * Registro de usuario a través de Google.
 */
export const googleRegister = async (req, res, next) => {
  try {
    // El usuario ya está autenticado y disponible en req.user gracias a Passport
    const user = req.user;

    // Verificar si el usuario necesita autenticación de dos factores
    if (user.twoFactorEnabled) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tempTokenExpires = Date.now() + (10 * 60 * 1000); // 10 minutos
      user.twoFactorTempToken = tempToken;
      user.twoFactorTempExpires = tempTokenExpires;
      await user.save();

      // Redirigir al frontend con los parámetros necesarios para 2FA
      const clientURI = req.query.state ? decodeURIComponent(req.query.state) : 'http://localhost:3000';
      return res.redirect(`${clientURI}/auth/login?twoFactorRequired=true&tempToken=${tempToken}`);
    } else {
      // Sin 2FA: generar JWT y asignar cookie
      const token = generateJWT(user);
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000, // 1 hora
      };
      res.cookie('token', token, cookieOptions);
      // Redirigir al frontend
      const clientURI = req.query.state ? decodeURIComponent(req.query.state) : 'http://localhost:3000';
      return res.redirect(clientURI);
    }
  } catch (error) {
    logger.error(`Error en registro vía Google: ${error.message}`);
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


/**
 * Actualizar el perfil del usuario autenticado.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { nombre, apellido, avatar } = req.body;
    const { id_usuario } = req.user;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new ValidationError([{
        msg: 'Usuario no encontrado.',
        param: 'user',
        location: 'body',
      }]);
    }

    // Actualizar los campos permitidos
    await user.update({
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      avatar: avatar || user.avatar,
      // Puedes añadir más campos si es necesario
    });

    logger.info(`Perfil actualizado exitosamente para el usuario ID ${id_usuario}`);

    // Aquí podrías implementar una notificación al usuario sobre la actualización

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        avatar: user.avatar,
        // Añade más campos si es necesario
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Error al actualizar perfil: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar el email del usuario autenticado.
 */
export const updateEmail = async (req, res, next) => {
  try {
    const { newEmail, confirmationCode } = req.body;
    const { id_usuario } = req.user;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new ValidationError([{
        msg: 'Usuario no encontrado.',
        param: 'user',
        location: 'body',
      }]);
    }

    if (newEmail === user.email) {
      throw new ValidationError([{
        msg: 'El nuevo email debe ser diferente al actual.',
        param: 'newEmail',
        location: 'body',
      }]);
    }

    // Verificar si el nuevo email ya está registrado
    const existingUser = await Usuario.findOne({ where: { email: newEmail } });
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    // Generar un token de confirmación
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

    // Actualizar los campos relevantes
    user.email = newEmail;
    user.emailConfirmed = false;
    user.emailToken = emailToken;
    user.emailTokenExpires = emailTokenExpires;

    await user.save();

    // Enviar el correo de confirmación al nuevo email
    const confirmURL = `${process.env.CLIENT_URI}/auth/confirm-email?token=${emailToken}&email=${newEmail}`;

    await sendEmail({
      to: newEmail,
      subject: 'Confirma tu nuevo correo electrónico',
      template: 'confirmEmail',
      context: {
        nombre: user.nombre,
        confirmURL,
      },
    });

    logger.info(`Se ha enviado un correo de confirmación a ${newEmail} para el usuario ID ${id_usuario}`);

    res.status(200).json({
      success: true,
      message: 'Se ha enviado un correo de confirmación al nuevo email. Por favor, confirma el cambio.',
    });
  } catch (error) {
    logger.error(`Error al actualizar email: ${error.message}`);
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
      throw new ValidationError([{
        msg: 'Usuario no encontrado.',
        param: 'user',
        location: 'body',
      }]);
    }

    // Verificar que se proporcione la contraseña actual y la nueva contraseña
    if (!currentPassword || !newPassword) {
      throw new ValidationError([
        {
          msg: 'La contraseña actual es obligatoria.',
          param: 'currentPassword',
          location: 'body',
        },
        {
          msg: 'La nueva contraseña es obligatoria.',
          param: 'newPassword',
          location: 'body',
        },
      ]);
    }

    // Verificar que la contraseña actual es correcta
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ValidationError([{
        msg: 'La contraseña actual es incorrecta.',
        param: 'currentPassword',
        location: 'body',
      }]);
    }

    // Validar la nueva contraseña (puedes reutilizar las validaciones del backend o implementarlas aquí)
    // Por ejemplo, asegurarse de que cumple con los requisitos de complejidad

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    user.password = hashedPassword;
    await user.save();

    logger.info(`Contraseña actualizada exitosamente para el usuario ID ${id_usuario}`);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente.',
    });
  } catch (error) {
    logger.error(`Error al actualizar contraseña: ${error.message}`);
    next(error);
  }
};  

/**
 * Subir/Reemplazar avatar del usuario autenticado.
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ninguna imagen',
      });
    }

    const { id_usuario } = req.user;
    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const newAvatarFilename = req.file.filename; 
    const newAvatarPath = path.join('assets', 'usersProfile', newAvatarFilename);

    // Eliminar avatar previo si lo deseas
    if (user.avatar && user.avatar !== newAvatarPath) {
      if (fs.existsSync(user.avatar)) {
        fs.unlinkSync(user.avatar);
      }
    }

    // Guardamos en la BD la ruta relativa
    user.avatar = newAvatarPath;
    await user.save();

    // Construimos la URL completa
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    // => e.g. "http://localhost:4000"
    const publicURL = `${baseUrl}/assets/usersProfile/${newAvatarFilename}`;

    return res.status(200).json({
      success: true,
      message: 'Avatar subido exitosamente',
      url: publicURL, 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir el avatar',
    });
  }
};