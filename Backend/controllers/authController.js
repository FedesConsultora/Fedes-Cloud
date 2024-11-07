// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

// Método para iniciar sesión
export const login = async (req, res, next) => {
  try {
    const { email, contraseña } = req.body;

    // Buscar al usuario por email
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
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

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Método para registrar un nuevo usuario
export const register = async (req, res, next) => {
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

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
