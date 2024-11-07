// controllers/userController.js
import bcrypt from 'bcrypt';
import { Usuario, Rol, Estado, Autenticacion } from '../models/index.js';

// Crear un nuevo usuario
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
      message: 'Usuario creado exitosamente',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res, next) => {
  try {
    const users = await Usuario.findAll({
      include: [Rol, Estado, Autenticacion],
    });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await Usuario.findByPk(req.params.id, {
      include: [Rol, Estado, Autenticacion],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario
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

    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
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

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
