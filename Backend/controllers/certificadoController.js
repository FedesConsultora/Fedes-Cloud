// controllers/certificadoController.js
import { Certificado, Servicio } from '../models/index.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import godaddySSLService from '../factories/godaddySSLService.js'; 
// ^ Este "godaddySSLService" es un adaptador o clase similar a "godaddyService" pero enfocado a endpoints SSL.

// ***** CRUD LOCAL *****

/**
 * Obtener todos los certificados locales. 
*/
export const getCertificates = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('view_services')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados.');
    }

    const certificados = await Certificado.findAll({
      include: [Servicio],
    });
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
 */
export const createCertificate = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_services')) {
      throw new PermissionDeniedError('No tienes permiso para crear certificados locales.');
    }

    const {
      id_servicio,
      productType, // DV_SSL, OV_SSL, etc.
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
    if (subjectAlternativeNames !== undefined) cert.subjectAlternativeNames = subjectAlternativeNames;
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
 * Crear una orden de certificado en GoDaddy (POST /v1/certificates)
 * - Recibir datos: productType, period, commonName, CSR, contact, etc.
 * - Llamar al adapter godaddySSLService para crear la orden.
 * - Guardar en la BD (goDaddyCertificateId) si es necesario.
 */
export const createCertificateOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('manage_ssl')) {
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

    // Construir payload para la API de GoDaddy
    const certificateCreatePayload = {
      productType: productType || 'DV_SSL',
      commonName,
      csr,
      period,
      contact, // { email, jobTitle, nameFirst, nameLast, phone, etc. }
      organization, // { address, name, phone... } - opcional DV
      subjectAlternativeNames,
      callbackUrl, // si deseas registrar callback
      // Otros campos: rootType, intelVPro, slotSize, etc. si aplica
    };

    // Llamar a tu servicio o adapter
    const result = await godaddySSLService.createCertificateOrder(certificateCreatePayload);
    // result: { certificateId: "123456" }

    // Podrías crear un registro local de Certificado con goDaddyCertificateId
    // o actualizar uno existente si tenías un "pendiente".
    // Ejemplo rápido:
    // const nuevoCert = await Certificado.create({ ... })

    return res.status(202).json({
      success: true,
      message: 'Orden de certificado creada en GoDaddy (pendiente).',
      data: result, 
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
    if (!req.user || !req.user.permisos.includes('manage_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para validar órdenes de certificado en GoDaddy.');
    }
    const payload = req.body; // Mismo formato que /create-order (sin domain, etc.)

    const validation = await godaddySSLService.validateCertificateOrder(payload);

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
 * Obtener detalles de un certificado en GoDaddy (GET /v1/certificates/{certificateId})
 */
export const getGoDaddyCertificateInfo = async (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos.includes('view_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    const details = await godaddySSLService.getCertificateInfo(goDaddyCertId);

    // Podrías, opcionalmente, sincronizar algunos campos en tu BD local
    // Ej. fechaEmision, fechaExpiracion, status, subjectAlternativeNames, etc.

    return res.status(200).json({
      success: true,
      data: details,
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
    if (!req.user || !req.user.permisos.includes('view_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para ver certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    const actions = await godaddySSLService.getCertificateActions(goDaddyCertId);

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
    if (!req.user || !req.user.permisos.includes('manage_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para cancelar certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    await godaddySSLService.cancelCertificate(goDaddyCertId);

    // Opcionalmente, actualizar la BD local estadoCertificado = 'Cancelado'
    // ...

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
    if (!req.user || !req.user.permisos.includes('view_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para descargar certificados en GoDaddy.');
    }

    const { goDaddyCertId } = req.params;
    const downloadData = await godaddySSLService.downloadCertificate(goDaddyCertId);
    // Normalmente, downloadData = { pems: { certificate, cross, intermediate, root }, serialNumber }

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
    if (!req.user || !req.user.permisos.includes('manage_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para reemitir certificados en GoDaddy.');
    }
    const { goDaddyCertId } = req.params;
    const payload = req.body; // { callbackUrl, commonName, csr, delayExistingRevoke, rootType, subjectAlternativeNames... }

    const reissueResponse = await godaddySSLService.reissueCertificate(goDaddyCertId, payload);

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
    if (!req.user || !req.user.permisos.includes('manage_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para renovar certificados en GoDaddy.');
    }
    const { goDaddyCertId } = req.params;
    const payload = req.body; // { callbackUrl, commonName, csr, period, rootType, subjectAlternativeNames, ... }

    const renewResp = await godaddySSLService.renewCertificate(goDaddyCertId, payload);
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
    if (!req.user || !req.user.permisos.includes('manage_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para revocar certificados en GoDaddy.');
    }
    const { goDaddyCertId } = req.params;
    const { reason } = req.body; // { reason: "KEY_COMPROMISE" | "AFFILIATION_CHANGED" | etc. }

    await godaddySSLService.revokeCertificate(goDaddyCertId, { reason });

    // Actualizar BD local si corresponde => estadoCertificado = 'Revocado'
    // ...

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
    if (!req.user || !req.user.permisos.includes('view_ssl')) {
      throw new PermissionDeniedError('No tienes permiso para ver el site seal de un certificado.');
    }
    const { goDaddyCertId } = req.params;
    const { theme = 'LIGHT', locale = 'en' } = req.query; // Ejemplo de params

    const sealData = await godaddySSLService.getSiteSeal(goDaddyCertId, { theme, locale });
    // sealData typically => { html: "<script>...</script>" }

    return res.status(200).json({
      success: true,
      data: sealData,
    });
  } catch (error) {
    logger.error(`Error al obtener site seal del certificado: ${error.message}`);
    next(error);
  }
};
