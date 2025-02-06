// src/controllers/billingController.js
import { UsuarioFacturacion } from '../models/index.js';
import logger from '../utils/logger.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';

/**
 * Crear o actualizar los datos de facturación del usuario.
 * Si ya existen, se actualizan; si no, se crean.
 */
export const createOrUpdateBilling = async (req, res, next) => {
  try {
    const { facturacion } = req.body;
    const { id_usuario, permisos } = req.user;

    if (!permisos.includes('update_billing_details')) {
      throw new PermissionDeniedError('No tienes permiso para gestionar datos de facturación.');
    }

    if (
      !facturacion ||
      !facturacion.razonSocial ||
      !facturacion.domicilio ||
      !facturacion.ciudad ||
      !facturacion.provincia ||
      !facturacion.pais ||
      !facturacion.condicionIVA
    ) {
      throw new ValidationError('Faltan datos obligatorios para la facturación.');
    }

    let billingRecord = await UsuarioFacturacion.findOne({ where: { id_usuario } });

    if (billingRecord) {
      // Actualizar el registro existente
      billingRecord.razonSocial = facturacion.razonSocial;
      billingRecord.domicilio = facturacion.domicilio;
      billingRecord.ciudad = facturacion.ciudad;
      billingRecord.provincia = facturacion.provincia;
      billingRecord.pais = facturacion.pais;
      billingRecord.condicionIVA = facturacion.condicionIVA;
      await billingRecord.save();
    } else {
      // Crear un nuevo registro
      billingRecord = await UsuarioFacturacion.create({
        id_usuario,
        razonSocial: facturacion.razonSocial,
        domicilio: facturacion.domicilio,
        ciudad: facturacion.ciudad,
        provincia: facturacion.provincia,
        pais: facturacion.pais,
        condicionIVA: facturacion.condicionIVA,
      });
    }

    logger.info(`Datos de facturación gestionados para Usuario ${id_usuario}`);
    res.status(200).json({
      success: true,
      message: 'Datos de facturación gestionados exitosamente.',
      data: billingRecord,
    });
  } catch (error) {
    logger.error(`Error al gestionar datos de facturación: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener los datos de facturación del usuario autenticado.
 * Si no existen, se crea un registro vacío (con valores por defecto) y se retorna.
 */
export const getBilling = async (req, res, next) => {
  try {
    const { id_usuario, permisos } = req.user;

    if (!permisos.includes('update_billing_details')) {
      throw new PermissionDeniedError('No tienes permiso para ver datos de facturación.');
    }

    // Buscar el registro de facturación del usuario
    let billingRecord = await UsuarioFacturacion.findOne({ where: { id_usuario } });

    // Si no existe, se crea un registro "vacío" (con valores por defecto)
    if (!billingRecord) {
      billingRecord = await UsuarioFacturacion.create({
        id_usuario,
        razonSocial: '',
        domicilio: '',
        ciudad: '',
        provincia: 'Buenos Aires', 
        pais: '',
        condicionIVA: '',
      });
      logger.info(`Se creó un registro vacío de facturación para el Usuario ${id_usuario}`);
    }

    res.status(200).json({
      success: true,
      message: 'Datos de facturación obtenidos exitosamente.',
      data: billingRecord,
    });
  } catch (error) {
    logger.error(`Error al obtener datos de facturación: ${error.message}`);
    next(error);
  }
};