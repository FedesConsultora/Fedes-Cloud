// src/controllers/userContactController.js
import { UsuarioContacto } from '../models/index.js';
import logger from '../utils/logger.js';
import { ValidationError, PermissionDeniedError } from '../utils/errors/GeneralErrors.js';

/**
 * Crear un nuevo contacto de usuario.
 */
export const createContact = async (req, res, next) => {
  try {
    const { contacto } = req.body;
    const { id_usuario, permisos, subRole } = req.user;

     // Si el usuario tiene un subrol (es decir, es un subusuario), solo permitir si el subrol es 'Administrador' o 'Facturación'
     if (subRole && !['Administrador', 'Facturación'].includes(subRole)) {
      throw new PermissionDeniedError('No tienes permiso para crear contactos de usuario.');
     }

    if (!permisos.includes('update_contact_details')) {
      throw new PermissionDeniedError('No tienes permiso para crear contactos de usuario.');
    }
    if (!contacto || !contacto.tipo_contacto) {
      throw new ValidationError('Datos de contacto inválidos.');
    }

    // Crear el contacto usando solo los campos necesarios para dirección y datos de contacto
    const nuevoContacto = await UsuarioContacto.create({
      id_usuario,
      tipo_contacto: contacto.tipo_contacto, // por ejemplo, 'Admin' o 'Tech'
      nameFirst: contacto.nameFirst,
      nameMiddle: contacto.nameMiddle || '',
      nameLast: contacto.nameLast,
      email: contacto.email,
      phone: contacto.phone,
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
 * Obtener todos los contactos del usuario autenticado.
 * Si no existen, se crea un registro vacío y se retorna.
 */
export const getContact = async (req, res, next) => {
  try {
    const { id_usuario, permisos } = req.user;

    if (!permisos.includes('update_contact_details')) {
      throw new PermissionDeniedError('No tienes permiso para ver contactos de usuario.');
    }

    // Usar findOne para obtener un único registro de contacto
    let contacto = await UsuarioContacto.findOne({
      where: { id_usuario },
      // Si utilizas asociaciones o quieres excluir ciertos campos, puedes configurar aquí.
    });

    // Si no existe, crea un registro vacío para el usuario
    if (!contacto) {
      contacto = await UsuarioContacto.create({
        id_usuario,
        tipo_contacto: 'Admin',  // Valor por defecto
        nameFirst: '',
        nameMiddle: '',
        nameLast: '',
        email: '',       // Asegúrate de que este campo exista en el modelo si lo necesitas
        phone: '',
        jobTitle: '',
        organization: '',
        // Si en el futuro agregas campos de dirección, inclúyelos aquí.
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contacto obtenido exitosamente.',
      data: contacto,
    });
  } catch (error) {
    logger.error(`Error al obtener contacto: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un contacto de usuario específico.
 */
export const updateContact = async (req, res, next) => {
  try {
    const { id_contacto } = req.params;
    const { contacto } = req.body;
    const { id_usuario, permisos, subRole } = req.user;
    
    // Si el usuario tiene un subrol, solo permitir la actualización si es 'Administrador' o 'Facturación'
    if (subRole && !['Administrador', 'Facturación'].includes(subRole)) {
      throw new PermissionDeniedError('No tienes permiso para actualizar contactos de usuario.');
    }

    if (!permisos.includes('update_contact_details')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar contactos de usuario.');
    }

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
 * Eliminar un contacto de usuario específico.
 */
export const deleteContact = async (req, res, next) => {
  try {
    const { id_contacto } = req.params;
    const { id_usuario, permisos } = req.user;

    if (!permisos.includes('update_contact_details')) {
      throw new PermissionDeniedError('No tienes permiso para eliminar contactos de usuario.');
    }

    const contacto = await UsuarioContacto.findOne({
      where: { id_contacto, id_usuario },
    });

    if (!contacto) {
      return res.status(404).json({
        success: false,
        message: `Contacto con ID ${id_contacto} no encontrado.`,
      });
    }

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
