// docs/permisoDocs.js

/**
 * @swagger
 * /permisos:
 *   get:
 *     summary: Obtener todos los permisos
 *     tags:
 *       - Permisos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de permisos obtenida exitosamente
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
 *                   example: 'Permisos obtenidos exitosamente'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permiso'
 *       '401':
 *         description: No autorizado
 *       '403':
 *         description: Permiso denegado
 *       '500':
 *         description: Error interno del servidor
 * 
 *   post:
 *     summary: Crear un nuevo permiso
 *     tags:
 *       - Permisos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermiso'
 *     responses:
 *       '201':
 *         description: Permiso creado exitosamente
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
 *                   example: 'Permiso creado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Permiso'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '403':
 *         description: Permiso denegado
 *       '500':
 *         description: Error interno del servidor
 * 
 * /permisos/{id_permiso}:
 *   put:
 *     summary: Actualizar un permiso existente
 *     tags:
 *       - Permisos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_permiso
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del permiso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePermiso'
 *     responses:
 *       '200':
 *         description: Permiso actualizado exitosamente
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
 *                   example: 'Permiso actualizado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Permiso'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '403':
 *         description: Permiso denegado
 *       '500':
 *         description: Error interno del servidor
 * 
 *   delete:
 *     summary: Eliminar un permiso
 *     tags:
 *       - Permisos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_permiso
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del permiso a eliminar
 *     responses:
 *       '200':
 *         description: Permiso eliminado exitosamente
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
 *                   example: 'Permiso eliminado exitosamente'
 *       '400':
 *         description: Datos de entrada inválidos
 *       '401':
 *         description: No autorizado
 *       '403':
 *         description: Permiso denegado
 *       '500':
 *         description: Error interno del servidor
 */
