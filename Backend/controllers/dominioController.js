// controllers/dominioController.js
import { Dominio, Servicio } from '../models/index.js';
import logger from '../utils/logger.js';
import { ValidationError, PermissionDeniedError } from '../utils/errors/GeneralErrors.js';
import godaddyService from '../factories/godaddyServiceFactory.js';

/**
 * Obtener todos los dominios (locales en la BD).
 */
export const getDominios = async (req, res, next) => {
  try {
    // Antes: manage_services
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver los dominios locales.');
    }

    const dominios = await Dominio.findAll({ include: [Servicio] });
    res.status(200).json({
      success: true,
      message: 'Dominios obtenidos exitosamente',
      data: dominios,
    });
  } catch (error) {
    logger.error(`Error al obtener dominios: ${error.message}`);
    next(error);
  }
};

/**
 * Crear un nuevo dominio en la BD local (sin registrar en GoDaddy).
 */
export const createDominio = async (req, res, next) => {
  try {
    // Antes: manage_services
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para crear dominios locales.');
    }

    const { id_servicio, nombreDominio, fechaExpiracion, bloqueado, proteccionPrivacidad } = req.body;

    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) {
      throw new ValidationError(`El servicio con ID ${id_servicio} no existe.`);
    }

    const nuevoDominio = await Dominio.create({
      id_servicio,
      nombreDominio,
      fechaExpiracion,
      bloqueado,
      proteccionPrivacidad,
    });

    logger.info(`Dominio creado exitosamente: ID ${nuevoDominio.id_dominio}`);
    res.status(201).json({
      success: true,
      message: 'Dominio creado exitosamente',
      data: nuevoDominio,
    });
  } catch (error) {
    logger.error(`Error al crear dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un dominio local por su ID.
 */
export const getDominioById = async (req, res, next) => {
  try {
    // Antes: manage_services
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver este dominio.');
    }

    const { id_dominio } = req.params;
    const dominio = await Dominio.findByPk(id_dominio, { include: [Servicio] });

    if (!dominio) {
      return res.status(404).json({
        success: false,
        message: `Dominio con ID ${id_dominio} no encontrado.`,
      });
    }

    res.status(200).json({
      success: true,
      data: dominio,
    });
  } catch (error) {
    logger.error(`Error al obtener dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un dominio local.
 */
export const updateDominio = async (req, res, next) => {
  try {
    // Antes: manage_services
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar dominios locales.');
    }

    const { id_dominio } = req.params;
    const { nombreDominio, fechaExpiracion, bloqueado, proteccionPrivacidad } = req.body;

    const dominio = await Dominio.findByPk(id_dominio);
    if (!dominio) {
      return res.status(404).json({
        success: false,
        message: `Dominio con ID ${id_dominio} no encontrado.`,
      });
    }

    if (nombreDominio !== undefined) dominio.nombreDominio = nombreDominio;
    if (fechaExpiracion !== undefined) dominio.fechaExpiracion = fechaExpiracion;
    if (bloqueado !== undefined) dominio.bloqueado = bloqueado;
    if (proteccionPrivacidad !== undefined) dominio.proteccionPrivacidad = proteccionPrivacidad;

    await dominio.save();
    logger.info(`Dominio actualizado: ID ${id_dominio}`);
    res.status(200).json({
      success: true,
      message: 'Dominio actualizado exitosamente',
      data: dominio,
    });
  } catch (error) {
    logger.error(`Error al actualizar dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un dominio local.
 */
export const deleteDominio = async (req, res, next) => {
  try {
    // Antes: manage_services
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para eliminar dominios locales.');
    }

    const { id_dominio } = req.params;
    const dominio = await Dominio.findByPk(id_dominio);
    if (!dominio) {
      return res.status(404).json({
        success: false,
        message: `Dominio con ID ${id_dominio} no encontrado.`,
      });
    }

    await dominio.destroy();
    logger.info(`Dominio eliminado: ID ${id_dominio}`);
    res.status(200).json({
      success: true,
      message: 'Dominio eliminado exitosamente',
    });
  } catch (error) {
    logger.error(`Error al eliminar dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Verificar disponibilidad de un dominio con la API de GoDaddy.
 * POST /dominios/check-availability
 * Body: { domain: "example.com" }
 */
export const checkDomain = async (req, res, next) => {
  try {
    // Sustituimos manage_services => check_domain_availability
    if (!req.user || !req.user.permisos.includes('check_domain_availability')) {
      throw new PermissionDeniedError('No tienes permiso para chequear dominios en GoDaddy.');
    }

    const { domain } = req.body;
    if (!domain) {
      throw new ValidationError('El campo "domain" es obligatorio.');
    }

    const result = await godaddyService.checkDomainAvailability(domain);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error al chequear disponibilidad: ${error.message}`);

    const errorMsg = error.message || '';
    if (errorMsg.includes('GoDaddy API error (checkDomain): 422')) {
      let cause = null;
      const match = errorMsg.match(/\{.*\}$/s);
      if (match && match[0]) {
        try { cause = JSON.parse(match[0]); } catch (_) { /* ignore */ }
      }
      return res.status(422).json({
        success: false,
        message: cause?.message || 'TLD no soportado o dominio inválido',
        errors: cause?.fields || [],
      });
    }

    if (errorMsg.includes('GoDaddy API error (checkDomain): 400')) {
      return res.status(400).json({
        success: false,
        message: 'Solicitud malformada a GoDaddy (400)',
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      errors: [],
    });
  }
};

/**
 * Obtener lista de TLDs soportados por GoDaddy
 * GET /dominios/tlds
 */
export const getTLDs = async (req, res, next) => {
  try {
    // Para listar TLDs, usamos 'suggest_domains' (o podrías usar otro)
    if (!req.user || !req.user.permisos.includes('suggest_domains')) {
      throw new PermissionDeniedError('No tienes permiso para ver TLDs de GoDaddy.');
    }

    const tlds = await godaddyService.getTLDs();
    return res.status(200).json({
      success: true,
      data: tlds,
    });
  } catch (error) {
    logger.error(`Error al obtener TLDs: ${error.message}`);
    next(error);
  }
};

export const suggestDomains = async (req, res, next) => {
  try {
    // Sustituimos manage_services => suggest_domains
    if (!req.user || !req.user.permisos.includes('suggest_domains')) {
      throw new PermissionDeniedError('No tienes permiso para sugerir dominios.');
    }

    const { query, country, city, limit, sources, tlds } = req.body;
    if (!query) {
      throw new ValidationError('El campo "query" es obligatorio.');
    }

    const suggestions = await godaddyService.suggestDomains({ query, country, city, limit /*...*/ });
    return res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error(`Error al sugerir dominios: ${error.message}`);
    next(error);
  }
};

/** 
 * Registrar un dominio usando la API de GoDaddy (y guardar en BD).
 * POST /dominios/registrar
 */
export const registerDominio = async (req, res, next) => {
  try {
    // Sustituimos manage_services => register_domain
    if (!req.user || !req.user.permisos.includes('register_domain')) {
      throw new PermissionDeniedError('No tienes permiso para registrar dominios en GoDaddy.');
    }

    const { domain, id_servicio, period, privacy, ...rest } = req.body;
    if (!domain) {
      throw new ValidationError('El dominio es requerido para el registro.');
    }
    if (!id_servicio) {
      throw new ValidationError('El "id_servicio" es requerido para asociar el dominio.');
    }

    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) {
      throw new ValidationError(`El servicio con ID ${id_servicio} no existe.`);
    }

    const result = await godaddyService.registerDomain(domain, { period, privacy, ...rest });

    const expiracionEstimada = new Date();
    expiracionEstimada.setFullYear(expiracionEstimada.getFullYear() + (period || 1));

    const nuevoDominio = await Dominio.create({
      id_servicio,
      nombreDominio: domain,
      fechaExpiracion: expiracionEstimada,
      bloqueado: true,
      proteccionPrivacidad: !!privacy
    });

    logger.info(`Dominio registrado en GoDaddy y almacenado en BD: ${domain}`);
    return res.status(201).json({
      success: true,
      message: 'Dominio en proceso de registro',
      data: {
        goDaddyOrder: result,
        dominioLocal: nuevoDominio
      }
    });
  } catch (error) {
    logger.error(`Error al registrar dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Renovar un dominio existente en GoDaddy.
 * POST /dominios/renovar
 * Body: { domain: "example.com", period: 1, renewAuto: true }
 */
export const renewDominio = async (req, res, next) => {
  try {
    // Sustituimos manage_services => renew_domain
    if (!req.user || !req.user.permisos.includes('renew_domain')) {
      throw new PermissionDeniedError('No tienes permiso para renovar dominios en GoDaddy.');
    }

    const { domain, period, renewAuto } = req.body;
    if (!domain) {
      throw new ValidationError('El dominio es requerido para renovar.');
    }

    const payload = { domain, period, renewAuto };
    const result = await godaddyService.renewDomain(payload);

    const dominioLocal = await Dominio.findOne({ where: { nombreDominio: domain } });
    if (dominioLocal) {
      const nuevaExpiracion = new Date();
      nuevaExpiracion.setFullYear(nuevaExpiracion.getFullYear() + (period || 1));
      dominioLocal.fechaExpiracion = nuevaExpiracion;
      await dominioLocal.save();

      logger.info(`Dominio ${domain} renovado en GoDaddy y fechaExpiracion actualizada en BD`);
    } else {
      logger.warn(`Dominio ${domain} renovado en GoDaddy, pero no existe en BD local`);
    }

    return res.status(200).json({
      success: true,
      message: 'Renovación en proceso',
      data: result
    });
  } catch (error) {
    logger.error(`Error al renovar dominio: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar DNS en GoDaddy.
 * PUT /dominios/:domain/records/:type
 */
export const updateDNS = async (req, res, next) => {
  try {
    // Sustituimos manage_services => manage_dns_records
    if (!req.user || !req.user.permisos.includes('manage_dns_records')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar DNS en GoDaddy.');
    }

    const { domain, type } = req.params;
    const records = req.body;
    if (!domain || !type) {
      throw new ValidationError('El dominio y el tipo de registro son obligatorios en la ruta.');
    }

    await godaddyService.updateDNSRecords(domain, type, records);

    logger.info(`DNS de tipo ${type} actualizados en GoDaddy para el dominio ${domain}`);
    return res.status(200).json({
      success: true,
      message: `DNS de tipo ${type} actualizados en el dominio ${domain}`
    });
  } catch (error) {
    logger.error(`Error al actualizar DNS: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener info de un dominio y sincronizar con la BD local.
 * GET /dominios/:domain/info
 */
export const getDomainInfo = async (req, res, next) => {
  try {
    // Antes: manage_services => quizas "view_dns_records"?
    if (!req.user || !req.user.permisos.includes('view_dns_records')) {
      throw new PermissionDeniedError('No tienes permiso para ver la info DNS/GoDaddy de este dominio.');
    }

    const { domain } = req.params;
    if (!domain) {
      throw new ValidationError('El dominio es requerido en la ruta.');
    }

    const info = await godaddyService.getDomainInfo(domain);

    const dominioLocal = await Dominio.findOne({ where: { nombreDominio: domain } });
    if (dominioLocal) {
      if (info.expires) {
        dominioLocal.fechaExpiracion = new Date(info.expires);
      }
      if (typeof info.locked === 'boolean') {
        dominioLocal.bloqueado = info.locked;
      }
      if (typeof info.privacy === 'boolean') {
        dominioLocal.proteccionPrivacidad = info.privacy;
      }
      await dominioLocal.save();

      logger.info(`Dominio ${domain} sincronizado con la info de GoDaddy en BD local`);
    } else {
      logger.warn(`Dominio ${domain} existe en GoDaddy pero no está en la BD local`);
    }

    return res.status(200).json({
      success: true,
      data: {
        goDaddyInfo: info,
        dominioLocal: dominioLocal ?? null
      }
    });
  } catch (error) {
    logger.error(`Error al obtener info del dominio: ${error.message}`);
    next(error);
  }
};
