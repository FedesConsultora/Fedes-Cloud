// controllers/certificadoController.js
import { Certificado, Servicio } from '../models/index.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import goDaddyService from '../factories/godaddyServiceFactory.js'; 
import { generateCSR } from '../utils/csrGenerator.js';

// ***** CRUD LOCAL *****

/**
 * Obtener todos los certificados locales. 
 */
export const getCertificates = async (req, res, next) => {
  try {
    // Ajustado: Requiere 'view_services' para ver la lista de certificados
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados.');
    }

    const certificados = await Certificado.findAll({ include: [Servicio] });
    return res.status(200).json({
      success: true,
      message: 'Certificados obtenidos exitosamente',
      data: certificados,
    });
  } catch (error) {
    logger.error(`Error al obtener certificados: ${error.message}`);
    next(error);
  }
};

/**
 * Crear un nuevo registro de Certificado en la BD (sin llamar a GoDaddy).
 * Mantengo 'manage_services' porque es el que venías usando para crear elementos locales.
 */
export const createCertificate = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para crear certificados locales.');
    }

    const {
      id_servicio,
      productType, 
      commonName,
      subjectAlternativeNames,
      period,
      csr,
      fechaEmision,
      fechaExpiracion,
      estadoCertificado,
    } = req.body;

    // Verificar que el servicio exista
    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) {
      throw new ValidationError(`El servicio con ID ${id_servicio} no existe.`);
    }

    const nuevoCert = await Certificado.create({
      id_servicio,
      productType: productType || 'DV_SSL',
      commonName: commonName || null,
      subjectAlternativeNames: subjectAlternativeNames || null,
      period: period || null,
      csr: csr || null,
      fechaEmision: fechaEmision || null,
      fechaExpiracion: fechaExpiracion || null,
      estadoCertificado: estadoCertificado || 'Pendiente',
    });

    logger.info(`Certificado creado localmente: ID ${nuevoCert.id_certificado}`);
    return res.status(201).json({
      success: true,
      message: 'Certificado creado exitosamente en BD local',
      data: nuevoCert,
    });
  } catch (error) {
    logger.error(`Error al crear certificado local: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener un certificado local por su ID.
 */
export const getCertificateById = async (req, res, next) => {
  try {
    // Se mantiene 'view_services' para leer detalles locales
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados.');
    }

    const { id_certificado } = req.params;
    const cert = await Certificado.findByPk(id_certificado, { include: [Servicio] });
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificado con ID ${id_certificado} no encontrado.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: cert,
    });
  } catch (error) {
    logger.error(`Error al obtener certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizar un certificado local.
 */
export const updateCertificate = async (req, res, next) => {
  try {
    // Se mantiene 'manage_services' para actualizar registro local
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para actualizar certificados locales.');
    }

    const { id_certificado } = req.params;
    const {
      productType,
      commonName,
      subjectAlternativeNames,
      period,
      csr,
      fechaEmision,
      fechaExpiracion,
      estadoCertificado,
      callbackUrl,
    } = req.body;

    const cert = await Certificado.findByPk(id_certificado);
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificado con ID ${id_certificado} no encontrado.`,
      });
    }

    if (productType !== undefined) cert.productType = productType;
    if (commonName !== undefined) cert.commonName = commonName;
    if (subjectAlternativeNames !== undefined) {
      cert.subjectAlternativeNames = subjectAlternativeNames;
    }
    if (period !== undefined) cert.period = period;
    if (csr !== undefined) cert.csr = csr;
    if (fechaEmision !== undefined) cert.fechaEmision = fechaEmision;
    if (fechaExpiracion !== undefined) cert.fechaExpiracion = fechaExpiracion;
    if (estadoCertificado !== undefined) cert.estadoCertificado = estadoCertificado;
    if (callbackUrl !== undefined) cert.callbackUrl = callbackUrl;

    await cert.save();

    logger.info(`Certificado actualizado: ID ${id_certificado}`);
    return res.status(200).json({
      success: true,
      message: 'Certificado actualizado exitosamente',
      data: cert,
    });
  } catch (error) {
    logger.error(`Error al actualizar certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Eliminar un certificado local.
 */
export const deleteCertificate = async (req, res, next) => {
  try {
    // Se mantiene 'manage_services' para eliminación local
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para eliminar certificados locales.');
    }

    const { id_certificado } = req.params;
    const cert = await Certificado.findByPk(id_certificado);
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificado con ID ${id_certificado} no encontrado.`,
      });
    }

    await cert.destroy();
    logger.info(`Certificado local eliminado: ID ${id_certificado}`);
    return res.status(200).json({
      success: true,
      message: 'Certificado eliminado exitosamente',
    });
  } catch (error) {
    logger.error(`Error al eliminar certificado: ${error.message}`);
    next(error);
  }
};

// ***** INTEGRACIÓN CON GODADDY *****

/**
 * Crear una orden de certificado en GoDaddy y guardarla localmente.
 * POST /certificados/create-order
 */
export const createCertificateOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('install_ssl_cert')) {
      throw new PermissionDeniedError('No tienes permiso para crear certificados en GoDaddy.');
    }

    const {
      productType,
      commonName,
      csr,
      period,
      contact,
      organization,
      subjectAlternativeNames,
      callbackUrl,
    } = req.body;

    let finalCSR = csr;
    // Si no se envía un CSR, generarlo (se requiere commonName)
    if (!finalCSR) {
      if (!commonName) {
        throw new ValidationError('El campo commonName es requerido para generar el CSR.');
      }
      const { csr: generatedCSR, privateKey } = await generateCSR(commonName);
      logger.info('CSR generado automáticamente.');
      finalCSR = generatedCSR;
      // Aquí se recomienda guardar el privateKey de forma segura.
    }

    // Construir payload para la API de GoDaddy
    const certificateCreatePayload = {
      productType: productType || 'DV_SSL',
      commonName,
      csr: finalCSR,
      period,
      contact,
      organization,
      subjectAlternativeNames,
      callbackUrl,
    };

    logger.info(`Payload para crear certificado: ${JSON.stringify(certificateCreatePayload)}`);

    // Llamar al servicio/adapter para crear la orden en GoDaddy
    const result = await goDaddyService.createCertificateOrder(certificateCreatePayload);
    logger.info(`Orden de certificado creada en GoDaddy: ${JSON.stringify(result)}`);

    // --- CREAR/OBTENER EL SERVICIO DEL USUARIO ---
    // Buscamos un servicio existente para el usuario
    let servicio = await Servicio.findOne({ where: { id_usuario: req.user.id_usuario } });
    if (!servicio) {
      // Si no existe, lo creamos (puedes ajustar el nombre y estado según convenga)
      servicio = await Servicio.create({
        id_usuario: req.user.id_usuario,
        nombre: `${req.user.nombre} - Servicio SSL`,
        estado: 'Activo',
      });
      logger.info(`Servicio creado automáticamente para el usuario ${req.user.id_usuario}: ID ${servicio.id_servicio}`);
    }

    // --- GUARDAR EL CERTIFICADO LOCALMENTE ---
    const nuevoCertificado = await Certificado.create({
      id_servicio: servicio.id_servicio,
      goDaddyCertificateId: result.certificateId,
      productType: certificateCreatePayload.productType,
      commonName: certificateCreatePayload.commonName,
      subjectAlternativeNames: certificateCreatePayload.subjectAlternativeNames,
      period: certificateCreatePayload.period,
      csr: certificateCreatePayload.csr,
      estadoCertificado: 'Pendiente',
      callbackUrl: certificateCreatePayload.callbackUrl || null,
      // fechaEmision y fechaExpiracion quedarán null hasta que se emita el certificado
    });
    logger.info(`Certificado guardado localmente: ID ${nuevoCertificado.id_certificado}`);

    return res.status(202).json({
      success: true,
      message: 'Orden de certificado creada en GoDaddy (pendiente) y almacenada localmente.',
      data: nuevoCertificado,
    });
  } catch (error) {
    logger.error(`Error al crear orden de certificado GoDaddy: ${error.message}`);
    next(error);
  }
};

/**
 * Validar la orden de certificado en GoDaddy (POST /v1/certificates/validate)
 */
export const validateCertificateOrder = async (req, res, next) => {
  try {
    // También 'install_ssl_cert' para validar la orden antes de comprar
    if (!req.user || !req.user.permisos.includes('install_ssl_cert')) {
      throw new PermissionDeniedError('No tienes permiso para validar órdenes de certificado en GoDaddy.');
    }
    const payload = req.body; // Mismo formato que /create-order

    const validation = await goDaddyService.validateCertificateOrder(payload);

    return res.status(200).json({
      success: true,
      message: 'Validación exitosa de la orden de certificado.',
      data: validation,
    });
  } catch (error) {
    logger.error(`Error al validar orden de certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener detalles de un certificado en GoDaddy y sincronizar con la BD local.
 * GET /certificados/{goDaddyCertId}/info
 */
export const getGoDaddyCertificateInfo = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;

    // Llamar al servicio para obtener detalles de GoDaddy
    const details = await goDaddyService.getCertificateInfo(goDaddyCertId);
    logger.info(`Detalles obtenidos desde GoDaddy: ${JSON.stringify(details)}`);

    // --- OBTENER O CREAR EL SERVICIO DEL USUARIO ---
    let servicio = await Servicio.findOne({ where: { id_usuario: req.user.id_usuario } });
    if (!servicio) {
      servicio = await Servicio.create({
        id_usuario: req.user.id_usuario,
        nombre: `${req.user.nombre} - Servicio SSL`,
        estado: 'Activo',
      });
      logger.info(`Servicio creado automáticamente para el usuario ${req.user.id_usuario}: ID ${servicio.id_servicio}`);
    }

    // Buscar el certificado local usando el goDaddyCertificateId
    let certificadoLocal = await Certificado.findOne({ where: { goDaddyCertificateId: goDaddyCertId } });

    // Si ya existe, actualizar campos; si no, crearlo
    if (certificadoLocal) {
      certificadoLocal.commonName = details.commonName || certificadoLocal.commonName;
      certificadoLocal.estadoCertificado = details.status || certificadoLocal.estadoCertificado;
      certificadoLocal.fechaEmision = details.validStart ? new Date(details.validStart) : certificadoLocal.fechaEmision;
      certificadoLocal.fechaExpiracion = details.validEnd ? new Date(details.validEnd) : certificadoLocal.fechaExpiracion;
      // Actualiza otros campos relevantes si lo necesitas
      await certificadoLocal.save();
    } else {
      certificadoLocal = await Certificado.create({
        id_servicio: servicio.id_servicio,
        goDaddyCertificateId: details.certificateId,
        productType: details.productType,
        commonName: details.commonName,
        subjectAlternativeNames: details.subjectAlternativeNames,
        period: details.period,
        csr: '', // O el valor que corresponda
        estadoCertificado: details.status,
        fechaEmision: details.validStart ? new Date(details.validStart) : null,
        fechaExpiracion: details.validEnd ? new Date(details.validEnd) : null,
        // callbackUrl puede dejarse null o actualizarlo si es necesario
      });
      logger.info(`Certificado creado localmente a partir de detalles de GoDaddy: ID ${certificadoLocal.id_certificado}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Detalles del certificado obtenidos y sincronizados.',
      data: certificadoLocal,
    });
  } catch (error) {
    logger.error(`Error al obtener detalle de certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener historial de acciones de un certificado (GET /v1/certificates/{certificateId}/actions)
 */
export const getGoDaddyCertificateActions = async (req, res, next) => {
  try {
    // Igual que antes: 'view_services'
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    const actions = await goDaddyService.getCertificateActions(goDaddyCertId);

    return res.status(200).json({
      success: true,
      data: actions, 
    });
  } catch (error) {
    logger.error(`Error al obtener acciones del certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Cancelar un certificado pendiente en GoDaddy (POST /v1/certificates/{certificateId}/cancel)
 */
export const cancelCertificate = async (req, res, next) => {
  try {
    // Asimilar "cancelar un pedido" con "revocar" en cierto sentido => 'revoke_ssl_cert'
    if (!req.user || !req.user.permisos.includes('revoke_ssl_cert')) {
      throw new PermissionDeniedError('No tienes permiso para cancelar certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    await goDaddyService.cancelCertificate(goDaddyCertId);

    return res.status(204).json({
      success: true,
      message: 'Certificado cancelado exitosamente en GoDaddy.',
    });
  } catch (error) {
    logger.error(`Error al cancelar certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Descargar un certificado emitido (GET /v1/certificates/{certificateId}/download)
 */
export const downloadCertificate = async (req, res, next) => {
  try {
    // Lectura => 'view_services'
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para descargar certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    const downloadData = await goDaddyService.downloadCertificate(goDaddyCertId);

    return res.status(200).json({
      success: true,
      data: downloadData,
    });
  } catch (error) {
    logger.error(`Error al descargar certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Reemitir un certificado (POST /v1/certificates/{certificateId}/reissue)
 */
export const reissueCertificate = async (req, res, next) => {
  try {
    // Reemisión => se puede interpretar como "renovar" la configuración => 'renew_ssl_cert'
    if (!req.user || !req.user.permisos.includes('renew_ssl_cert')) {
      throw new PermissionDeniedError('No tienes permiso para reemitir certificados en GoDaddy.');
    }
    const { goDaddyCertId } = req.params;
    const payload = req.body;

    const reissueResponse = await goDaddyService.reissueCertificate(goDaddyCertId, payload);

    return res.status(202).json({
      success: true,
      message: 'Solicitud de reemisión creada.',
      data: reissueResponse,
    });
  } catch (error) {
    logger.error(`Error al reemitir certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Renovar un certificado (POST /v1/certificates/{certificateId}/renew)
 */
export const renewCertificate = async (req, res, next) => {
  try {
    // Renovar => 'renew_ssl_cert'
    if (!req.user || !req.user.permisos.includes('renew_ssl_cert')) {
      throw new PermissionDeniedError('No tienes permiso para renovar certificados en GoDaddy.');
    }
    const { goDaddyCertId } = req.params;
    const payload = req.body;

    const renewResp = await goDaddyService.renewCertificate(goDaddyCertId, payload);
    return res.status(202).json({
      success: true,
      message: 'Renovación solicitada.',
      data: renewResp,
    });
  } catch (error) {
    logger.error(`Error al renovar certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Revocar un certificado (POST /v1/certificates/{certificateId}/revoke)
 */
export const revokeCertificate = async (req, res, next) => {
  try {
    // Revocar => 'revoke_ssl_cert'
    if (!req.user || !req.user.permisos.includes('revoke_ssl_cert')) {
      throw new PermissionDeniedError('No tienes permiso para revocar certificados en GoDaddy.');
    }
    const { goDaddyCertId } = req.params;
    const { reason } = req.body; // { reason: "KEY_COMPROMISE", ... }

    await goDaddyService.revokeCertificate(goDaddyCertId, { reason });

    return res.status(204).json({
      success: true,
      message: 'Certificado revocado con éxito.',
    });
  } catch (error) {
    logger.error(`Error al revocar certificado: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener site seal de un certificado emitido (GET /v1/certificates/{certificateId}/siteSeal)
 */
export const getCertificateSiteSeal = async (req, res, next) => {
  try {
    // Lectura => 'view_services'
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver el site seal de un certificado.');
    }
    const { goDaddyCertId } = req.params;
    const { theme = 'LIGHT', locale = 'en' } = req.query;

    const sealData = await goDaddyService.getSiteSeal(goDaddyCertId, { theme, locale });
    return res.status(200).json({
      success: true,
      data: sealData,
    });
  } catch (error) {
    logger.error(`Error al obtener site seal del certificado: ${error.message}`);
    next(error);
  }
};

export const updateCertificateStatuses = async (req, res, next) => {
  try {
    // Opcional: Podés restringir a ciertos roles/ permisos
    await pollCertificateStatus();
    res.status(200).json({
      success: true,
      message: 'Estados de certificados actualizados.'
    });
  } catch (error) {
    next(error);
  }
};