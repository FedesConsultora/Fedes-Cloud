// docs/schemas.js

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id_usuario:
 *           type: integer
 *           description: ID único del usuario
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *           example: 'Administrador'
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *           example: 'Principal'
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *           example: 'admin@example.com'
 *         fechaNacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del usuario
 *           example: '1980-01-01'
 *         ultimaActividad:
 *           type: string
 *           format: date-time
 *           description: Última actividad del usuario
 *           example: '2023-12-31T23:59:59Z'
 *         preferenciasNotificaciones:
 *           type: boolean
 *           description: Preferencias de notificaciones
 *           example: true
 *         id_estado:
 *           type: integer
 *           description: ID del estado del usuario
 *           example: 1
 *         id_rol:
 *           type: integer
 *           description: ID del rol del usuario
 *           example: 1
 *         id_autenticacion:
 *           type: integer
 *           description: ID del método de autenticación del usuario
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario
 *           example: '2023-01-01T00:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del usuario
 *           example: '2023-01-01T00:00:00Z'
 *     RegisterUser:
 *       type: object
 *       required:
 *         - nombre
 *         - apellido
 *         - email
 *         - password
 *         - fechaNacimiento
 *         - id_autenticacion
 *       properties:
 *         nombre:
 *           type: string
 *           example: 'Nuevo'
 *         apellido:
 *           type: string
 *           example: 'Usuario'
 *         email:
 *           type: string
 *           example: 'nuevo.usuario@example.com'
 *         password:
 *           type: string
 *           example: 'NuevoP@ssw0rd'
 *         fechaNacimiento:
 *           type: string
 *           format: date
 *           example: '1995-05-15'
 *         id_autenticacion:
 *           type: integer
 *           example: 1
 *     CreateUser:
 *       type: object
 *       required:
 *         - nombre
 *         - apellido
 *         - email
 *         - password
 *         - fechaNacimiento
 *         - id_rol
 *         - id_autenticacion
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *           example: 'Nuevo'
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *           example: 'Usuario'
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *           example: 'nuevo.usuario@example.com'
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *           example: 'NuevoP@ssw0rd'
 *         fechaNacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del usuario
 *           example: '1995-05-15'
 *         id_rol:
 *           type: integer
 *           description: ID del rol del usuario
 *           example: 2
 *         id_autenticacion:
 *           type: integer
 *           description: ID del método de autenticación del usuario
 *           example: 1
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: 'admin@example.com'
 *         password:
 *           type: string
 *           example: 'Admin@123'
 *     Role:
 *       type: object
 *       properties:
 *         id_rol:
 *           type: integer
 *           description: ID único del rol
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del rol
 *           example: 'Admin'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del rol
 *           example: '2023-01-01T00:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del rol
 *           example: '2023-01-01T00:00:00Z'
 *     CreateRole:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: 'Interno'
 *     UpdateRole:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: 'Externo'
 *     Permiso:
 *       type: object
 *       properties:
 *         id_permiso:
 *           type: integer
 *           description: ID único del permiso
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del permiso
 *           example: 'manage_users'
 *         descripcion:
 *           type: string
 *           description: Descripción del permiso
 *           example: 'Permiso para gestionar usuarios'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del permiso
 *           example: '2023-01-01T00:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del permiso
 *           example: '2023-01-01T00:00:00Z'
 *     CreatePermiso:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del permiso
 *           example: 'manage_permissions'
 *         descripcion:
 *           type: string
 *           description: Descripción del permiso
 *           example: 'Permiso para gestionar permisos'
 *     UpdatePermiso:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del permiso
 *           example: 'manage_roles'
 *         descripcion:
 *           type: string
 *           description: Descripción del permiso
 *           example: 'Permiso para gestionar roles'
 *     RequestPasswordReset:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario que solicita el restablecimiento
 *           example: 'usuario@example.com'
 *     ResetPassword:
 *       type: object
 *       required:
 *         - token
 *         - password
 *       properties:
 *         token:
 *           type: string
 *           description: Token de restablecimiento de contraseña
 *           example: 'abcdef1234567890'
 *         password:
 *           type: string
 *           description: Nueva contraseña del usuario
 *           example: 'NuevaP@ssw0rd'
 *     ConfirmEmailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: 'Correo electrónico confirmado exitosamente'
 */