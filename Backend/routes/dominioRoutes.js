// routes/dominioRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as dominioController from '../controllers/dominioController.js';

const router = Router();

// Rutas de Dominios
router.get('/', authMiddleware, dominioController.getDominios);
router.post('/', authMiddleware, dominioController.createDominio);

// Restringimos :id_dominio a dígitos (\d+)
router.get('/:id_dominio(\\d+)', authMiddleware, dominioController.getDominioById);
router.put('/:id_dominio(\\d+)', authMiddleware, dominioController.updateDominio);
router.delete('/:id_dominio(\\d+)', authMiddleware, dominioController.deleteDominio);

// Rutas específicas de integración con GoDaddy
router.post('/check-availability', authMiddleware, dominioController.checkDomain);
router.post('/registrar', authMiddleware, dominioController.registerDominio);
router.post('/renovar', authMiddleware, dominioController.renewDominio);
router.put('/:domain/records/:type', authMiddleware, dominioController.updateDNS);
router.get('/:domain/info', authMiddleware, dominioController.getDomainInfo);

// Rutas que usan cadenas no numéricas (por ejemplo "tlds" o "sugerir")
router.post('/sugerir', authMiddleware, dominioController.suggestDomains);
router.get('/tlds', authMiddleware, dominioController.getTLDs);

export default router;
