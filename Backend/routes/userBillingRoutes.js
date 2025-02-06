import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as userBillingController from '../controllers/userBillingController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: UserBilling
 *   description: Operaciones relacionadas con los datos de facturación del usuario
 */

/**
 * @swagger
 * /user-billing:
 *   post:
 *     summary: Crear o actualizar los datos de facturación del usuario
 *     tags: [UserBilling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facturacion:
 *                 type: object
 *                 properties:
 *                   razonSocial:
 *                     type: string
 *                   domicilio:
 *                     type: string
 *                   ciudad:
 *                     type: string
 *                   provincia:
 *                     type: string
 *                   pais:
 *                     type: string
 *                   condicionIVA:
 *                     type: string
 *                     enum: [Consumidor Final, IVA responsable inscripto, Sujeto no categorizado, Exento, Monotributo, IVA no responsable]
 *     responses:
 *       200:
 *         description: Datos de facturación gestionados exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, userBillingController.createOrUpdateBilling);

/**
 * @swagger
 * /user-billing:
 *   get:
 *     summary: Obtener los datos de facturación del usuario autenticado
 *     tags: [UserBilling]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de facturación obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, userBillingController.getBilling);

export default router;
