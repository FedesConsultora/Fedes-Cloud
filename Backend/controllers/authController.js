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
        clientURI,
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
      
      // Establecer la expiración del token (por ejemplo, 24 horas)
      const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas en milisegundos

      // Convertir 'DD/MM/YYYY' a 'YYYY-MM-DD' para almacenar en la base de datos
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
        emailTokenExpires, // Establecer la expiración del token
        emailConfirmed: false,
      });
      
      console.log('clientURI: ', clientURI);
      
      // Enviar correo de confirmación usando plantilla
      const confirmURL = `${clientURI}/auth/confirm-email?token=${emailToken}&email=${newUser.email}`;

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
        throw new ValidationError([
          {
            msg: 'Por favor, confirma tu correo electrónico antes de iniciar sesión.',
            param: 'email',
            location: 'body',
          },
        ]);
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

      // Establecer la cookie HTTP-only
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,    // Requiere HTTPS
        sameSite: 'None', // Permitir envío cross-site
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        // No es necesario enviar el token en el cuerpo
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

      logger.info(`Intentando confirmar email: ${email} con token: ${token}`);

      const user = await Usuario.findOne({
        where: {
          email,
          emailToken: token,
        },
      });
      console.log('user: ', user);
      if (!user) {
        logger.warn(`Confirmación fallida: Token inválido o email no encontrado para ${email}`);
        throw new ValidationError([
          {
            msg: 'Token inválido o expirado.',
            param: 'email',
            location: 'query',
          },
        ]);
      }

      // Verificar si el token ha expirado
      if (user.emailTokenExpires < Date.now()) {
        logger.warn(`Confirmación fallida: Token expirado para ${email}`);
        throw new ValidationError([
          {
            msg: 'El token ha expirado. Por favor, solicita un nuevo correo de confirmación.',
            param: 'email',
            location: 'query',
          },
        ]);
      }

      // Verificar si el email ya está confirmado
      if (user.emailConfirmed) {
        logger.warn(`Confirmación innecesaria: Email ${email} ya está confirmado`);
        throw new ValidationError([
          {
            msg: 'El correo electrónico ya está confirmado.',
            param: 'email',
            location: 'query',
          },
        ]);
      }

      user.emailConfirmed = true;
      user.emailToken = null;
      user.emailTokenExpires = null; // Limpiar el token y su expiración

      await user.save();

      logger.info(`Correo electrónico confirmado exitosamente para ${email}`);

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
      const { email, clientURI } = req.body;

      // Validar que clientURI esté presente
      if (!clientURI) {
        throw new ValidationError([
          {
            msg: 'El clientURI es obligatorio.',
            param: 'clientURI',
            location: 'body',
          },
        ]);
      }

      // Validar que clientURI sea una URL válida y pertenezca a una lista blanca
      const allowedClientURIs = [
        'http://localhost:3000',
        'https://tudominio.com',
        // Agrega otros dominios permitidos aquí
      ];

      if (!allowedClientURIs.includes(clientURI)) {
        throw new ValidationError([
          {
            msg: 'clientURI no está permitido.',
            param: 'clientURI',
            location: 'body',
          },
        ]);
      }

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

      // Construir la URL de restablecimiento
      const resetURL = `${clientURI}/auth/reset-password?token=${resetToken}&email=${user.email}`;

      // Enviar correo de restablecimiento usando plantilla
      await sendEmail({
        to: user.email,
        subject: 'Restablecimiento de Contraseña',
        template: 'resetPassword', // Nombre de la plantilla sin extensión
        context: {
          nombre: user.nombre,
          resetURL,
        },
      });

      logger.info(`Solicitud de restablecimiento de contraseña enviada a ${email}`);

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

  /**
   * Reenviar confirmación de correo electrónico
   */
  export const resendConfirmEmail = async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await Usuario.findOne({ where: { email } });

      if (!user) {
        logger.warn(`Reenvío fallido: Usuario con email ${email} no encontrado`);
        // Respuesta genérica por seguridad
        return res.status(200).json({
          success: true,
          message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para confirmar tu cuenta.',
        });
      }

      if (user.emailConfirmed) {
        logger.info(`Usuario con email ${email} ya ha confirmado su correo`);
        return res.status(200).json({
          success: true,
          message: 'Tu correo electrónico ya está confirmado. Puedes iniciar sesión.',
        });
      }

      // Generar nuevo token de confirmación
      const emailToken = crypto.randomBytes(32).toString('hex');
      const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

      user.emailToken = emailToken;
      user.emailTokenExpires = emailTokenExpires;

      await user.save();

      // Construir la URL de confirmación
      const confirmURL = `${req.body.clientURI}/auth/confirm-email?token=${emailToken}&email=${user.email}`;

      // Enviar correo de confirmación
      await sendEmail({
        to: user.email,
        subject: 'Confirma tu correo electrónico',
        template: 'confirmEmail',
        context: {
          nombre: user.nombre,
          confirmURL,
        },
      });

      logger.info(`Nuevo token de confirmación enviado a ${email}`);

      res.status(200).json({
        success: true,
        message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para confirmar tu cuenta.',
      });
    } catch (error) {
      logger.error(`Error al reenviar confirmación de correo: ${error.message}`);
      next(error);
    }
  };


  /**
   * Reenviar restablecimiento de contraseña
   */
  export const resendPasswordReset = async (req, res, next) => {
    try {
      const { email, clientURI } = req.body;

      if (!email || !clientURI) {
        throw new ValidationError([
          {
            msg: 'El email y el clientURI son obligatorios.',
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

      // Validar que clientURI sea una URL válida y pertenezca a una lista blanca
      const allowedClientURIs = [
        'http://localhost:3000',
        'https://tudominio.com',
        // Agrega otros dominios permitidos aquí
      ];

      if (!allowedClientURIs.includes(clientURI)) {
        throw new ValidationError([
          {
            msg: 'clientURI no está permitido.',
            param: 'clientURI',
            location: 'body',
          },
        ]);
      }

      const user = await Usuario.findOne({ where: { email } });

      if (!user) {
        logger.warn(`Reenvío fallido: Usuario con email ${email} no encontrado`);
        // Respuesta genérica por seguridad
        return res.status(200).json({
          success: true,
          message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        });
      }

      if (user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
        logger.warn(`Reenvío fallido: Ya existe una solicitud de restablecimiento activa para ${email}`);
        return res.status(429).json({
          success: false,
          message: 'Ya has solicitado un restablecimiento de contraseña recientemente. Por favor, espera antes de intentar nuevamente.',
          errors: [],
        });
      }

      // Generar nuevo token de restablecimiento
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = Date.now() + 3600000; // 1 hora

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetPasswordExpires;

      await user.save();

      // Construir la URL de restablecimiento
      const resetURL = `${clientURI}/auth/reset-password?token=${resetToken}&email=${user.email}`;

      // Enviar correo de restablecimiento
      await sendEmail({
        to: user.email,
        subject: 'Restablecimiento de Contraseña',
        template: 'resetPassword', // Nombre de la plantilla sin extensión
        context: {
          nombre: user.nombre,
          resetURL,
        },
      });

      logger.info(`Nuevo token de restablecimiento enviado a ${email}`);

      res.status(200).json({
        success: true,
        message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      });
    } catch (error) {
      logger.error(`Error al reenviar restablecimiento de contraseña: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cerrar sesión de usuario
   */
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

  /**
 * Obtener perfil del usuario autenticado
 */
export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    console.log(id)
    const user = await Usuario.findOne({
      where: { id_usuario: id }, // Aquí cambias 'id' por 'id_usuario'
      attributes: { exclude: ['password', 'emailToken', 'emailTokenExpires', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      throw new ValidationError([
        {
          msg: 'Usuario no encontrado.',
          param: 'user',
          location: 'database',
        },
      ]);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Error al obtener perfil: ${error.message}`);
    next(error);
  }
};