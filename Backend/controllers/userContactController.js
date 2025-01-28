// src/controllers/userContactController.js

import UsuarioContacto from '../models/UsuarioContacto.js';
import logger from '../utils/logger.js';
import { ValidationError, PermissionDeniedError } from '../utils/errors/GeneralErrors.js';

/**
 * Crear un nuevo contacto de usuario
 */
export const createContact = async (req, res, next) => {
  const { contacto } = req.body;
  const { id_usuario, permisos } = req.user; // Asumiendo que 'permisos' es un array en el objeto user

  try {
    // Verificar permisos
    if (!permisos.includes('manage_user_contacts')) {
      throw new PermissionDeniedError('No tienes permiso para crear contactos de usuario.');
    }

    // Validar existencia de contacto y tipo_contacto
    if (!contacto || !contacto.tipo_contacto) {
      throw new ValidationError('Datos de contacto inválidos.');
    }

    // Crear el contacto
    const nuevoContacto = await UsuarioContacto.create({
      id_usuario,
      tipo_contacto: contacto.tipo_contacto,
      nameFirst: contacto.nameFirst,
      nameMiddle: contacto.nameMiddle || '',
      nameLast: contacto.nameLast,
      email: contacto.email,
      phone: contacto.phone,
      fax: contacto.fax || '',
      jobTitle: contacto.jobTitle,
      organization: contacto.organization,
      address1: contacto.addressMailing.address1,
      address2: contacto.addressMailing.address2 || '',
      city: contacto.addressMailing.city,
      state: contacto.addressMailing.state,
      postalCode: contacto.addressMailing.postalCode,
      country: contacto.addressMailing.country,
    });

    logger.info(`Contacto creado exitosamente: ID ${nuevoContacto.id_contacto} para Usuario ${id_usuario}`);
    res.status(201).json({
      success: true,
      message: 'Contacto creado exitosamente.',
      data: nuevoContacto,
    });
  } catch (error) {
    logger.error(`Error al crear contacto: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener todos los contactos del usuario autenticado
 */
export const getContacts = async (req, res, next) => {
  const { id_usuario, permisos } = req.user;

  try {
    // Verificar permisos
    if (!permisos.includes('view_user_contacts')) {
      throw new PermissionDeniedError('No tienes permiso para ver contactos de usuario.');
    }

    const contactos = await UsuarioContacto.findAll({
      where: { id_usuario },
      attributes: { exclude: ['id_usuario'] }, // Opcional: excluir campos si es necesario
    });

    res.status(200).json({
      success: true,
      message: 'Contactos obtenidos exitosamente.',
      data: contactos,
    });
  } catch (error) {
    logger.error(`Error al obtener contactos: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un contacto de usuario específico
 */
export const updateContact = async (req, res, next) => {
  const { id_contacto } = req.params;
  const { contacto } = req.body;
  const { id_usuario, permisos } = req.user;

  try {
    // Verificar permisos
    if (!permisos.includes('manage_user_contacts')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar contactos de usuario.');
    }

    // Validar existencia de contacto
    const existingContacto = await UsuarioContacto.findOne({
      where: { id_contacto, id_usuario },
    });

    if (!existingContacto) {
      return res.status(404).json({
        success: false,
        message: `Contacto con ID ${id_contacto} no encontrado.`,
      });
    }

    // Actualizar los campos permitidos
    const fieldsToUpdate = [
      'tipo_contacto',
      'nameFirst',
      'nameMiddle',
      'nameLast',
      'email',
      'phone',
      'fax',
      'jobTitle',
      'organization',
      'address1',
      'address2',
      'city',
      'state',
      'postalCode',
      'country',
    ];

    fieldsToUpdate.forEach((field) => {
      if (contacto[field] !== undefined) {
        existingContacto[field] = contacto[field];
      }
    });

    await existingContacto.save();

    logger.info(`Contacto actualizado: ID ${id_contacto} para Usuario ${id_usuario}`);
    res.status(200).json({
      success: true,
      message: 'Contacto actualizado exitosamente.',
      data: existingContacto,
    });
  } catch (error) {
    logger.error(`Error al actualizar contacto: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un contacto de usuario específico
 */
export const deleteContact = async (req, res, next) => {
  const { id_contacto } = req.params;
  const { id_usuario, permisos } = req.user;

  try {
    // Verificar permisos
    if (!permisos.includes('manage_user_contacts')) {
      throw new PermissionDeniedError('No tienes permiso para eliminar contactos de usuario.');
    }

    // Buscar el contacto
    const contacto = await UsuarioContacto.findOne({
      where: { id_contacto, id_usuario },
    });

    if (!contacto) {
      return res.status(404).json({
        success: false,
        message: `Contacto con ID ${id_contacto} no encontrado.`,
      });
    }

    // Eliminar el contacto
    await contacto.destroy();

    logger.info(`Contacto eliminado: ID ${id_contacto} para Usuario ${id_usuario}`);
    res.status(200).json({
      success: true,
      message: 'Contacto eliminado exitosamente.',
    });
  } catch (error) {
    logger.error(`Error al eliminar contacto: ${error.message}`);
    next(error);
  }
};
    