// src/routes/contactRoutes.js

import { Router } from 'express';
import * as contactController from '../controllers/userContactController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contacto
 *   description: Operaciones relacionadas con los contactos de usuario
 */

/**
 * @swagger
 * /v1/user-contact:
 *   post:
 *     summary: Crear un nuevo contacto de usuario
 *     tags: [Contacto]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contacto:
 *                 type: object
 *                 properties:
 *                   tipo_contacto:
 *                     type: string
 *                     enum: [Admin, Billing, Registrant, Tech]
 *                   nameFirst:
 *                     type: string
 *                   nameMiddle:
 *                     type: string
 *                   nameLast:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   fax:
 *                     type: string
 *                   jobTitle:
 *                     type: string
 *                   organization:
 *                     type: string
 *                   addressMailing:
 *                     type: object
 *                     properties:
 *                       address1:
 *                         type: string
 *                       address2:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                         enum: [US, MX, ES] // Añade más según necesidad
 *     responses:
 *       201:
 *         description: Contacto creado exitosamente
 *       400:
 *         description: Datos inválidos o conflicto de tipo de contacto
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, contactController.createContact);

/**
 * @swagger
 * /v1/user-contact:
 *   get:
 *     summary: Obtener todos los contactos del usuario autenticado
 *     tags: [Contacto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contactos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, contactController.getContacts);

/**
 * @swagger
 * /v1/user-contact/{id_contacto}:
 *   put:
 *     summary: Actualizar un contacto de usuario
 *     tags: [Contacto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contacto
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del contacto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contacto:
 *                 type: object
 *                 properties:
 *                   tipo_contacto:
 *                     type: string
 *                     enum: [Admin, Billing, Registrant, Tech]
 *                   nameFirst:
 *                     type: string
 *                   nameMiddle:
 *                     type: string
 *                   nameLast:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   fax:
 *                     type: string
 *                   jobTitle:
 *                     type: string
 *                   organization:
 *                     type: string
 *                   addressMailing:
 *                     type: object
 *                     properties:
 *                       address1:
 *                         type: string
 *                       address2:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                         enum: [US, MX, ES] // Añade más según necesidad
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 *       400:
 *         description: Datos inválidos o conflicto de tipo de contacto
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id_contacto', authMiddleware, contactController.updateContact);

/**
 * @swagger
 * /v1/user-contact/{id_contacto}:
 *   delete:
 *     summary: Eliminar un contacto de usuario
 *     tags: [Contacto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contacto
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del contacto a eliminar
 *     responses:
 *       200:
 *         description: Contacto eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id_contacto', authMiddleware, contactController.deleteContact);

export default router;
