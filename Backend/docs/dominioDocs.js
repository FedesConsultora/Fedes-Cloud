/**
 * @swagger
 * tags:
 *   name: Dominios
 *   description: Gestión de Dominios (locales y vía GoDaddy)
 */

/**
 * @swagger
 * /dominios:
 *   get:
 *     summary: Obtener todos los dominios locales
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dominios obtenida exitosamente
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
 *                   example: 'Dominios obtenidos exitosamente'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Domain'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear un nuevo dominio en la BD local (sin registrar en GoDaddy)
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
 *                 example: 123
 *               nombreDominio:
 *                 type: string
 *                 example: "mi-dominio-local.com"
 *               fechaExpiracion:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               bloqueado:
 *                 type: boolean
 *                 example: false
 *               proteccionPrivacidad:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Dominio creado exitosamente
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
 *                   example: 'Dominio creado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Domain'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/{id_dominio}:
 *   get:
 *     summary: Obtener un dominio local por su ID
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_dominio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dominio en la BD local
 *     responses:
 *       200:
 *         description: Dominio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Dominio no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar un dominio local
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_dominio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dominio en la BD local
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
 *                   example: 'Dominio actualizado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Domain'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Dominio no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar un dominio local
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_dominio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dominio en la BD local
 *     responses:
 *       200:
 *         description: Dominio eliminado exitosamente
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
 *                   example: 'Dominio eliminado exitosamente'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Dominio no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/check-availability:
 *   post:
 *     summary: Verificar disponibilidad de un dominio (GoDaddy)
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckAvailabilityPayload'
 *     responses:
 *       '200':
 *         description: Disponibilidad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Respuesta de GoDaddy
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/registrar:
 *   post:
 *     summary: Registrar un dominio usando la API de GoDaddy (y guardarlo en la BD)
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDomainPayload'
 *     responses:
 *       '201':
 *         description: Dominio registrado exitosamente
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
 *                   example: 'Dominio en proceso de registro'
 *                 data:
 *                   type: object
 *                   properties:
 *                     goDaddyOrder:
 *                       type: object
 *                       description: Info de la orden devuelta por GoDaddy
 *                     dominioLocal:
 *                       $ref: '#/components/schemas/Domain'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/renovar:
 *   post:
 *     summary: Renovar un dominio existente en GoDaddy y actualizar en BD
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenewDomainPayload'
 *     responses:
 *       '200':
 *         description: Renovación en proceso
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
 *                   example: 'Renovación en proceso'
 *                 data:
 *                   type: object
 *                   description: Info de la orden devuelta por GoDaddy
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/{domain}/records/{type}:
 *   put:
 *     summary: Actualizar registros DNS de un dominio en GoDaddy
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre de dominio (ej. "example.com")
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Tipo de registro (A, CNAME, etc.)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   example: "127.0.0.1"
 *                 name:
 *                   type: string
 *                   example: "@"
 *                 ttl:
 *                   type: integer
 *                   example: 600
 *                 type:
 *                   type: string
 *                   example: "A"
 *     responses:
 *       '200':
 *         description: DNS actualizado exitosamente
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
 *                   example: 'DNS de tipo A actualizados en el dominio example.com'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/{domain}/info:
 *   get:
 *     summary: Obtener info de GoDaddy y sincronizar con BD local
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre de dominio a consultar en GoDaddy
 *     responses:
 *       '200':
 *         description: Info obtenida y sincronizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     goDaddyInfo:
 *                       type: object
 *                       description: Info devuelta por GoDaddy (locked, privacy, expires, etc.)
 *                     dominioLocal:
 *                       $ref: '#/components/schemas/Domain'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '404':
 *         description: El dominio no se encontró (en local) o GoDaddy devolvió error
 *       '500':
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/tlds:
 *   get:
 *     summary: Listar TLDs soportados y habilitados para la venta en GoDaddy
 *     tags: [Dominios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de TLDs disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "com"
 *                       type:
 *                         type: string
 *                         example: "GENERIC"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /dominios/sugerir:
 *   post:
 *     summary: Sugerir dominios basados en un término (GoDaddy suggestions)
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
 *               query:
 *                 type: string
 *                 description: Palabra clave o semilla para sugerir dominios
 *                 example: "enzopinotti"
 *               country:
 *                 type: string
 *                 description: ISO country code
 *                 example: "AR"
 *               city:
 *                 type: string
 *                 example: "Buenos Aires"
 *               limit:
 *                 type: integer
 *                 example: 5
 *             required:
 *               - query
 *     responses:
 *       200:
 *         description: Lista de dominios sugeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       domain:
 *                         type: string
 *                         example: "enzopinotti.dev"
 *       400:
 *         description: Falta la propiedad "query"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */