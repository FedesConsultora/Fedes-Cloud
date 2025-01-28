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
export const checkDomainAvailability = async (req, res, next) => {
  try {
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
    if (errorMsg.includes('GoDaddy API error (checkDomainAvailability): 422')) {
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

    if (errorMsg.includes('GoDaddy API error (checkDomainAvailability): 400')) {
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
    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('suggest_domains')) {
      throw new PermissionDeniedError('No tienes permiso para sugerir dominios.');
    }

    // Obtener parámetros de la consulta
    const {
      query, 
      country, 
      city, 
      limit = 8, 
      sources, 
      tlds, 
      lengthMax, 
      lengthMin, 
      waitMs = 1000, 
    } = req.query; 

    // Validar que 'query' esté presente
    if (!query) {
      throw new ValidationError('El parámetro "query" es obligatorio.');
    }

    

    // Obtener sugerencias de dominios
    const suggestions = await godaddyService.suggestDomains({
      query,
      country,
      city,
      limit,
      sources: sources ? sources.split(',') : undefined, // Asumiendo que 'sources' viene como cadena separada por comas
      tlds: tlds ? tlds.split(',') : undefined, // Asumiendo que 'tlds' viene como cadena separada por comas
      lengthMax,
      lengthMin,
      waitMs,
    });

    if (!suggestions || suggestions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No se encontraron dominios sugeridos.',
        data: [],
      });
    }

    // Verificar disponibilidad y obtener precio para cada dominio sugerido
    const suggestionsWithPricePromises = suggestions.map(async (sug) => {
      try {
        const availability = await godaddyService.checkDomainAvailability(sug.domain, 'FAST', false);
        if (availability.available) {
          return {
            domain: sug.domain,
            price: availability.price,
            currency: availability.currency || 'USD',
          };
        }
        return null; // No incluir dominios no disponibles
      } catch (error) {
        logger.error(`Error al verificar disponibilidad para ${sug.domain}: ${error.message}`);
        return null; // Omitir dominios que fallan en la verificación
      }
    });

    const suggestionsWithPrice = await Promise.all(suggestionsWithPricePromises);

    // Filtrar dominios que están disponibles
    const availableSuggestions = suggestionsWithPrice.filter(sug => sug !== null);

    return res.status(200).json({
      success: true,
      data: availableSuggestions,
    });
  } catch (error) {
    logger.error(`Error al sugerir dominios: ${error.message}`);

    const errorMsg = error.message || '';
    if (errorMsg.includes('GoDaddy API error (suggestDomains): 422')) {
      let cause = null;
      const match = errorMsg.match(/\{.*\}$/s);
      if (match && match[0]) {
        try { cause = JSON.parse(match[0]); } catch (_) { /* ignore */ }
      }
      return res.status(422).json({
        success: false,
        message: cause?.message || 'Parámetros inválidos para sugerir dominios',
        errors: cause?.fields || [],
      });
    }
    
    if (errorMsg.includes('GoDaddy API error (suggestDomains): 400')) {
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
 * Registrar un dominio usando la API de GoDaddy (y guardar en BD).
 * POST /dominios/registrar
 */
export const registerDominio = async (req, res, next) => {
  const transaction = await sequelize.transaction(); // Iniciar una transacción
  try {
    // Verificar permisos
    if (!req.user || !req.user.permisos.includes('register_domain')) {
      throw new PermissionDeniedError('No tienes permiso para registrar dominios en GoDaddy.');
    }

    const { domain, period, privacy, renewAuto, ...contactData } = req.body;
    if (!domain) {
      throw new ValidationError('El dominio es requerido para el registro.');
    }

    // Determinar el rol del usuario
    const isAdminOrInternal = ['admin', 'internal'].includes(req.user.rol); // Ajusta según tu modelo de roles

    // Buscar servicios existentes del usuario
    let servicio = await Servicio.findOne({
      where: { id_usuario: req.user.id_usuario },
      transaction,
    });

    if (!servicio) {
      if (isAdminOrInternal) {
        // Crear un nuevo servicio para usuarios internos o admin
        servicio = await Servicio.create(
          {
            nombre: `${req.user.nombre} Servicio Predeterminado`,
            estado: 'Activo',
            id_usuario: req.user.id_usuario,
          },
          { transaction }
        );
        logger.info(`Servicio creado automáticamente para usuario ${req.user.id_usuario}: ID ${servicio.id_servicio}`);
      } else {
        // Para usuarios externos, crear un servicio automáticamente sin exponerlo
        servicio = await Servicio.create(
          {
            nombre: `${req.user.nombre} Servicio`,
            estado: 'Activo',
            id_usuario: req.user.id_usuario,
          },
          { transaction }
        );
        logger.info(`Servicio creado automáticamente para usuario externo ${req.user.id_usuario}: ID ${servicio.id_servicio}`);
      }
    }

    // Validar campos de contacto y consentimiento
    const requiredContacts = ['contactAdmin', 'contactBilling', 'contactRegistrant', 'contactTech', 'consent'];
    for (const field of requiredContacts) {
      if (!contactData[field]) {
        throw new ValidationError(`El campo "${field}" es obligatorio.`);
      }
    }

    // Validar consentimiento
    if (
      !contactData.consent.agreedAt ||
      !contactData.consent.agreedBy ||
      !Array.isArray(contactData.consent.agreementKeys) ||
      contactData.consent.agreementKeys.length === 0
    ) {
      throw new ValidationError('Información de consentimiento incompleta.');
    }

    // Registrar el dominio utilizando el adaptador de GoDaddy
    const SHOPPER_ID = process.env.GODADDY_SHOPPER_ID; // Definir en variables de entorno
    const registrationResponse = await godaddyService.registerDomain(domain, {
      consent: contactData.consent,
      contactAdmin: contactData.contactAdmin,
      contactBilling: contactData.contactBilling,
      contactRegistrant: contactData.contactRegistrant,
      contactTech: contactData.contactTech,
      nameServers: contactData.nameServers || [], // Opcional
      period: period || 1,
      privacy: !!privacy,
      renewAuto: !!renewAuto,
    }, SHOPPER_ID); // Incluir el Shopper ID

    // Calcular la fecha de expiración
    const expiracionEstimada = new Date();
    expiracionEstimada.setFullYear(expiracionEstimada.getFullYear() + (period || 1));

    // Guardar la información del dominio en la base de datos
    const nuevoDominio = await Dominio.create(
      {
        id_servicio: servicio.id_servicio,
        nombreDominio: domain,
        fechaExpiracion: expiracionEstimada,
        bloqueado: true,
        proteccionPrivacidad: !!privacy,
      },
      { transaction }
    );

    logger.info(`Dominio registrado en GoDaddy y almacenado en BD: ${domain}`);

    await transaction.commit(); // Confirmar la transacción

    return res.status(201).json({
      success: true,
      message: 'Dominio en proceso de registro',
      data: {
        goDaddyOrder: registrationResponse,
        dominioLocal: nuevoDominio,
        id_servicio: servicio.id_servicio, // Incluir el servicio asociado
      },
    });
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
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
    // Verificar permisos
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
      // Actualizar la información en la base de datos
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

    // Preparar la respuesta para el frontend
    const responseData = {
      domain: info.domain || domain,
      available: info.available || false,
      price: info.price || null, // Asegúrate de que 'price' esté incluido en la respuesta de GoDaddy
      currency: info.currency || 'USD', // Asegúrate de que 'currency' esté incluido en la respuesta de GoDaddy
      // Puedes añadir más campos si es necesario
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    logger.error(`Error al obtener info del dominio: ${error.message}`);
    next(error);
  }
};
