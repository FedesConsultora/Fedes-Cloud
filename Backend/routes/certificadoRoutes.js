// routes/certificadoRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as certificadoController from '../controllers/certificadoController.js';

const router = Router();

/**
 * Rutas CRUD locales de Certificados
 * (Solo en tu base de datos, sin llamar a la API de GoDaddy)
 */
router.get('/', authMiddleware, certificadoController.getCertificates);
router.post('/', authMiddleware, certificadoController.createCertificate);

router.get('/:id_certificado(\\d+)', authMiddleware, certificadoController.getCertificateById);
router.put('/:id_certificado(\\d+)', authMiddleware, certificadoController.updateCertificate);
router.delete('/:id_certificado(\\d+)', authMiddleware, certificadoController.deleteCertificate);

/**
 * Rutas de Integración con GoDaddy para Certificados
 * Ejemplo: /certificados/create-order, /certificados/validate-order, etc.
 */

// Crear una orden pendiente en GoDaddy
router.post('/create-order', authMiddleware, certificadoController.createCertificateOrder);

// Validar la orden pendiente
router.post('/validate-order', authMiddleware, certificadoController.validateCertificateOrder);

// Obtener detalles de un certificado en GoDaddy
router.get('/:goDaddyCertId/info', authMiddleware, certificadoController.getGoDaddyCertificateInfo);

// Obtener historial de acciones
router.get('/:goDaddyCertId/actions', authMiddleware, certificadoController.getGoDaddyCertificateActions);

// Cancelar un certificado pendiente
router.post('/:goDaddyCertId/cancel', authMiddleware, certificadoController.cancelCertificate);

// Descargar certificado emitido
router.get('/:goDaddyCertId/download', authMiddleware, certificadoController.downloadCertificate);

// Reemitir (reissue)
router.post('/:goDaddyCertId/reissue', authMiddleware, certificadoController.reissueCertificate);

// Renovar
router.post('/:goDaddyCertId/renew', authMiddleware, certificadoController.renewCertificate);

// Revocar
router.post('/:goDaddyCertId/revoke', authMiddleware, certificadoController.revokeCertificate);

// Obtener site seal
router.get('/:goDaddyCertId/site-seal', authMiddleware, certificadoController.getCertificateSiteSeal);

// Ruta para actualizar manualmente el estado de certificados (por polling manual)
router.post('/update-statuses', authMiddleware, certificadoController.updateCertificateStatuses);

export default router;
