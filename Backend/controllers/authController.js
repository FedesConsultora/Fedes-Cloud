// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  InvalidCredentialsError,
  EmailAlreadyExistsError,
} from '../utils/errors/UserErrors.js';
import logger from '../utils/logger.js';
import { Usuario, Rol, Estado, Autenticacion } from '../models/index.js';
/**
 * Método para registrar un nuevo usuario
 */
export const register = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      email,
      contraseña,
      fechaNacimiento,
      id_autenticacion,
    } = req.body;

    // Validaciones básicas (puedes expandirlas según tus necesidades)
    if (!nombre || !apellido || !email || !contraseña || !fechaNacimiento || !id_autenticacion) {
      throw new ValidationError('Todos los campos requeridos deben ser proporcionados');
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registro fallido: Email ${email} ya está registrado`);
      throw new EmailAlreadyExistsError();
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Buscar el rol predeterminado (por ejemplo, 'Externo')
    const defaultRole = await Rol.findOne({ where: { nombre: 'Externo' } });
    if (!defaultRole) {
      logger.error(`Rol predeterminado 'Externo' no encontrado en la base de datos`);
      throw new Error('Rol predeterminado no configurado');
    }

    const newUser = await Usuario.create({
      nombre,
      apellido,
      email,
      contraseña: hashedPassword,
      fechaNacimiento,
      id_rol: defaultRole.id_rol, // Asignar el rol predeterminado
      id_estado: 1, // Estado activo por defecto
      preferenciasNotificaciones: true,
      id_autenticacion,
    });

    logger.info(`Usuario registrado exitosamente: ID ${newUser.id_usuario}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
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
    logger.error(`Error en registro de usuario: ${error.message}`);
    next(error);
  }
};

/**
 * Método para iniciar sesión
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