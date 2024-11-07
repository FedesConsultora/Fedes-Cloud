// controllers/roleController.js
import { Rol, Permiso } from '../models/index.js';

// Crear un nuevo rol
export const createRole = async (req, res, next) => {
  try {
    const { nombre, permisos } = req.body;

    const newRole = await Rol.create({ nombre });

    if (permisos && permisos.length > 0) {
      await newRole.setPermisos(permisos);
    }

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: newRole,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los roles
export const getRoles = async (req, res, next) => {
  try {
    const roles = await Rol.findAll({
      include: [Permiso],
    });
    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res, next) => {
  try {
    const role = await Rol.findByPk(req.params.id, {
      include: [Permiso],
    });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
    }
    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un rol
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, permisos } = req.body;

    const role = await Rol.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
    }

    await role.update({ nombre });

    if (permisos) {
      await role.setPermisos(permisos);
    }

    res.status(200).json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un rol
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Rol.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
    }

    await role.destroy();

    res.status(200).json({
      success: true,
      message: 'Rol eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
