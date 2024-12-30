/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtener todos los servicios
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de servicios obtenida exitosamente
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
 *                   example: 'Servicios obtenidos exitosamente'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 * 
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateService'
 *     responses:
 *       '201':
 *         description: Servicio creado exitosamente
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
 *                   example: 'Servicio creado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 * 
 * /services/{id_servicio}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_servicio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a obtener
 *     responses:
 *       '200':
 *         description: Servicio encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '404':
 *         description: Servicio no encontrado
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 * 
 *   put:
 *     summary: Actualizar un servicio existente
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_servicio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateService'
 *     responses:
 *       '200':
 *         description: Servicio actualizado exitosamente
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
 *                   example: 'Servicio actualizado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '404':
 *         description: Servicio no encontrado
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 * 
 *   delete:
 *     summary: Eliminar un servicio
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_servicio
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a eliminar
 *     responses:
 *       '200':
 *         description: Servicio eliminado exitosamente
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
 *                   example: 'Servicio eliminado exitosamente'
 *       '404':
 *         description: Servicio no encontrado
 *       '401':
 *         description: No autorizado
 *       '500':
 *         description: Error interno del servidor
 */
