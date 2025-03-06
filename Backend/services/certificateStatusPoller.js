// services/certificateStatusPoller.js
import { Certificado } from '../models/index.js';
import GoDaddyService from './goDaddyService.js';
import GoDaddyAdapter from '../adapters/godaddyAdapter.js';
import logger from '../utils/logger.js';

// Instanciar el servicio de GoDaddy
const goDaddyService = new GoDaddyService(new GoDaddyAdapter());

export const pollCertificateStatus = async () => {
  try {
    // Buscar certificados locales pendientes
    const certificadosPendientes = await Certificado.findAll({
      where: { estadoCertificado: 'Pendiente' }
    });

    for (const cert of certificadosPendientes) {
      try {
        // Consultar los detalles desde GoDaddy
        const details = await goDaddyService.getCertificateInfo(cert.goDaddyCertificateId);
        logger.info(`Detalles obtenidos para certificado ${cert.id_certificado}: ${JSON.stringify(details)}`);

        // Actualizar el certificado local según la respuesta
        let changed = false;
        if (details.status && details.status !== cert.estadoCertificado) {
          cert.estadoCertificado = details.status;
          changed = true;
        }
        if (details.validStart) {
          const nuevaFechaEmision = new Date(details.validStart);
          if (!cert.fechaEmision || nuevaFechaEmision.getTime() !== new Date(cert.fechaEmision).getTime()) {
            cert.fechaEmision = nuevaFechaEmision;
            changed = true;
          }
        }
        if (details.validEnd) {
          const nuevaFechaExpiracion = new Date(details.validEnd);
          if (!cert.fechaExpiracion || nuevaFechaExpiracion.getTime() !== new Date(cert.fechaExpiracion).getTime()) {
            cert.fechaExpiracion = nuevaFechaExpiracion;
            changed = true;
          }
        }
        if (changed) {
          await cert.save();
          logger.info(`Certificado ${cert.id_certificado} actualizado localmente.`);
        }
      } catch (error) {
        logger.error(`Error actualizando certificado ${cert.id_certificado}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error en polling de certificados: ${error.message}`);
  }
};
