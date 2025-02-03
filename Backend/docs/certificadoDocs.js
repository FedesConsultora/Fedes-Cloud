/**
 * @swagger
 * tags:
 *   name: Certificados
 *   description: Gestión de Certificados SSL (local y vía GoDaddy)
 */

/**
 * @swagger
 * /certificados:
 *   get:
 *     summary: Obtener todos los certificados locales
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de certificados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Certificados obtenidos exitosamente'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear un nuevo registro de certificado en la BD local (sin llamar a GoDaddy)
 *     tags: [Certificados]
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
 *                 example: 10
 *               productType:
 *                 type: string
 *                 example: "DV_SSL"
 *               commonName:
 *                 type: string
 *                 example: "misitio.com"
 *               subjectAlternativeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["www.misitio.com"]
 *               period:
 *                 type: integer
 *                 example: 1
 *               csr:
 *                 type: string
 *                 example: "-----BEGIN CERTIFICATE REQUEST-----\n..."
 *               fechaEmision:
 *                 type: string
 *                 format: date-time
 *               fechaExpiracion:
 *                 type: string
 *                 format: date-time
 *               estadoCertificado:
 *                 type: string
 *                 example: "Pendiente"
 *     responses:
 *       201:
 *         description: Certificado creado exitosamente en BD local
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Certificado creado exitosamente en BD local'
 *                 data:
 *                   $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{id_certificado}:
 *   get:
 *     summary: Obtener un certificado local por su ID
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_certificado
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del certificado en la BD local
 *     responses:
 *       200:
 *         description: Certificado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar un certificado local
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_certificado
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del certificado en la BD local
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productType:
 *                 type: string
 *               commonName:
 *                 type: string
 *               subjectAlternativeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               period:
 *                 type: integer
 *               csr:
 *                 type: string
 *               fechaEmision:
 *                 type: string
 *                 format: date-time
 *               fechaExpiracion:
 *                 type: string
 *                 format: date-time
 *               estadoCertificado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Certificado actualizado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar un certificado local
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_certificado
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del certificado en la BD local
 *     responses:
 *       200:
 *         description: Certificado eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Certificado eliminado exitosamente'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/create-order:
 *   post:
 *     summary: Crear una orden pendiente de certificado en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productType:
 *                 type: string
 *                 example: "DV_SSL"
 *               commonName:
 *                 type: string
 *                 example: "misitio.com"
 *               csr:
 *                 type: string
 *                 example: "-----BEGIN CERTIFICATE REQUEST-----\n..."
 *               period:
 *                 type: integer
 *                 example: 1
 *               contact:
 *                 type: object
 *                 description: Datos de contacto (email, nameFirst, nameLast, etc.)
 *               organization:
 *                 type: object
 *                 description: Datos de la organización
 *               subjectAlternativeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               callbackUrl:
 *                 type: string
 *                 example: "https://tuapp.com/callback"
 *     responses:
 *       202:
 *         description: Orden de certificado creada en GoDaddy (pendiente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     certificateId:
 *                       type: string
 *                       example: "123456"
 *       400:
 *         description: Solicitud malformada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       422:
 *         description: Datos inválidos en la solicitud
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/validate-order:
 *   post:
 *     summary: Validar la orden de certificado en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productType:
 *                 type: string
 *               commonName:
 *                 type: string
 *               csr:
 *                 type: string
 *               period:
 *                 type: integer
 *               contact:
 *                 type: object
 *               organization:
 *                 type: object
 *               subjectAlternativeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               callbackUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validación exitosa de la orden de certificado
 *       400:
 *         description: Solicitud malformada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       422:
 *         description: Datos inválidos en la solicitud
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/info:
 *   get:
 *     summary: Obtener detalles de un certificado en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     responses:
 *       200:
 *         description: Detalles del certificado obtenidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/actions:
 *   get:
 *     summary: Obtener historial de acciones del certificado en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     responses:
 *       200:
 *         description: Historial de acciones
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/cancel:
 *   post:
 *     summary: Cancelar un certificado pendiente en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     responses:
 *       204:
 *         description: Certificado cancelado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       409:
 *         description: Estado del certificado no permite cancel
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/download:
 *   get:
 *     summary: Descargar un certificado emitido en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     responses:
 *       200:
 *         description: Descarga exitosa (JSON con PEMs)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/reissue:
 *   post:
 *     summary: Reemitir (reissue) un certificado en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commonName:
 *                 type: string
 *               csr:
 *                 type: string
 *               rootType:
 *                 type: string
 *               subjectAlternativeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               delayExistingRevoke:
 *                 type: integer
 *                 example: 72
 *     responses:
 *       202:
 *         description: Reemisión solicitada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       409:
 *         description: Estado no permite reissue
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/renew:
 *   post:
 *     summary: Renovar un certificado en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               csr:
 *                 type: string
 *               period:
 *                 type: integer
 *               rootType:
 *                 type: string
 *               subjectAlternativeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       202:
 *         description: Renovación solicitada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       409:
 *         description: Estado no permite renovar
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/revoke:
 *   post:
 *     summary: Revocar un certificado activo en GoDaddy
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón de la revocación (AFFILIATION_CHANGED, KEY_COMPROMISE, etc.)
 *                 example: "AFFILIATION_CHANGED"
 *     responses:
 *       204:
 *         description: Certificado revocado con éxito
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       409:
 *         description: Estado no permite revocar
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /certificados/{certificateId}/site-seal:
 *   get:
 *     summary: Obtener el site seal de un certificado emitido
 *     tags: [Certificados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del certificado en GoDaddy
 *       - in: query
 *         name: theme
 *         schema:
 *           type: string
 *         required: false
 *         description: Tema del sello (LIGHT o DARK)
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: false
 *         description: Idioma, por defecto 'en'
 *     responses:
 *       200:
 *         description: Site Seal obtenido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Certificado no encontrado
 *       409:
 *         description: Estado no permite site seal
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         id_certificado:
 *           type: integer
 *           example: 1
 *         id_servicio:
 *           type: integer
 *           example: 10
 *         goDaddyCertificateId:
 *           type: string
 *           example: "123456"
 *         productType:
 *           type: string
 *           example: "DV_SSL"
 *         commonName:
 *           type: string
 *           example: "misitio.com"
 *         subjectAlternativeNames:
 *           type: array
 *           items:
 *             type: string
 *           example: ["www.misitio.com"]
 *         period:
 *           type: integer
 *           example: 1
 *         csr:
 *           type: string
 *           example: "-----BEGIN CERTIFICATE REQUEST-----\n..."
 *         estadoCertificado:
 *           type: string
 *           example: "Pendiente"
 *         fechaEmision:
 *           type: string
 *           format: date-time
 *           example: "2023-05-01T12:00:00Z"
 *         fechaExpiracion:
 *           type: string
 *           format: date-time
 *           example: "2024-05-01T12:00:00Z"
 *         callbackUrl:
 *           type: string
 *           example: "https://tuapp.com/ssl-callback"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 */
