// routes/dominioRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as dominioController from '../controllers/dominioController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dominios
 *   description: Gestión de Dominios
 */

/**
 * @swagger
 * /dominios:
 *   get:
 *     summary: Obtener todos los dominios
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dominios obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, dominioController.getDominios);

/**
 * @swagger
 * /dominios:
 *   post:
 *     summary: Crear un nuevo dominio
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_servicio:
 *                 type: integer
 *               nombreDominio:
 *                 type: string
 *               fechaExpiracion:
 *                 type: string
 *                 format: date-time
 *               bloqueado:
 *                 type: boolean
 *               proteccionPrivacidad:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Dominio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, dominioController.createDominio);

/**
 * @swagger
 * /dominios/{id_dominio}:
 *   get:
 *     summary: Obtener un dominio por su ID
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_dominio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dominio
 *     responses:
 *       200:
 *         description: Dominio obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Dominio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id_dominio', authMiddleware, dominioController.getDominioById);

/**
 * @swagger
 * /dominios/{id_dominio}:
 *   put:
 *     summary: Actualizar un dominio
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_dominio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dominio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreDominio:
 *                 type: string
 *               fechaExpiracion:
 *                 type: string
 *                 format: date-time
 *               bloqueado:
 *                 type: boolean
 *               proteccionPrivacidad:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Dominio actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Dominio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id_dominio', authMiddleware, dominioController.updateDominio);

/**
 * @swagger
 * /dominios/{id_dominio}:
 *   delete:
 *     summary: Eliminar un dominio
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_dominio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dominio a eliminar
 *     responses:
 *       200:
 *         description: Dominio eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Dominio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id_dominio', authMiddleware, dominioController.deleteDominio);

export default router;
