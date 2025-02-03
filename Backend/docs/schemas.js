/**
 * @swagger
 * components:
 *   schemas:
 * 
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
 *
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
 *
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
 *
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
 *
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
 *
 *     CreateRole:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: 'Interno'
 *
 *     UpdateRole:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: 'Externo'
 *
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
 *
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
 *
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
 *
 *     RequestPasswordReset:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario que solicita el restablecimiento
 *           example: 'usuario@example.com'
 *
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
 *
 *     ConfirmEmailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: 'Correo electrónico confirmado exitosamente'
 *
 *     Service:
 *       type: object
 *       properties:
 *         id_servicio:
 *           type: integer
 *           description: ID único del servicio
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del servicio
 *           example: 'Gestión de Certificados'
 *         estado:
 *           type: string
 *           description: Estado del servicio
 *           example: 'activo'
 *         idUsuario:
 *           type: integer
 *           description: ID del usuario asociado al servicio
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del servicio
 *           example: '2023-01-01T00:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del servicio
 *           example: '2023-01-01T00:00:00Z'
 *
 *     CreateService:
 *       type: object
 *       required:
 *         - nombre
 *         - estado
 *         - idUsuario
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del servicio
 *           example: 'Gestión de Certificados'
 *         estado:
 *           type: string
 *           description: Estado del servicio
 *           example: 'activo'
 *         idUsuario:
 *           type: integer
 *           description: ID del usuario asociado al servicio
 *           example: 1
 *
 *     Domain:
 *       type: object
 *       properties:
 *         id_dominio:
 *           type: integer
 *           description: ID interno autoincremental de la tabla Dominio
 *           example: 10
 *         id_servicio:
 *           type: integer
 *           description: Relación con la tabla Servicio
 *           example: 123
 *         nombreDominio:
 *           type: string
 *           description: Nombre de dominio (example.com)
 *           example: 'example.com'
 *         fechaExpiracion:
 *           type: string
 *           format: date-time
 *           description: Fecha estimada de expiración
 *           example: '2024-12-31T23:59:59Z'
 *         bloqueado:
 *           type: boolean
 *           description: Indica si el dominio está bloqueado (locked)
 *           example: true
 *         proteccionPrivacidad:
 *           type: boolean
 *           description: Indica si tiene WHOIS privacy activo
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación en la BD local
 *           example: '2023-01-01T00:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización en la BD
 *           example: '2023-01-01T00:00:00Z'
 *
 *     RegisterDomainPayload:
 *       type: object
 *       required:
 *         - domain
 *         - id_servicio
 *       properties:
 *         domain:
 *           type: string
 *           description: Nombre del dominio a registrar
 *           example: 'example.com'
 *         id_servicio:
 *           type: integer
 *           description: ID del servicio al que se asocia este dominio
 *           example: 123
 *         period:
 *           type: integer
 *           description: Cantidad de años a registrar
 *           example: 1
 *         renewAuto:
 *           type: boolean
 *           description: Indica si se renueva automáticamente
 *           example: true
 *         privacy:
 *           type: boolean
 *           description: Indica si se adquiere WHOIS privacy
 *           example: false
 *         consent:
 *           type: object
 *           properties:
 *             agreedAt:
 *               type: string
 *               format: date-time
 *               example: "2024-12-01T12:00:00Z"
 *             agreedBy:
 *               type: string
 *               example: "127.0.0.1"
 *             agreementKeys:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["DNRA"]
 *         contactAdmin:
 *           type: object
 *           description: Datos de contacto Admin
 *         contactRegistrant:
 *           type: object
 *           description: Datos de contacto Registrant
 *         contactTech:
 *           type: object
 *           description: Datos de contacto Técnico
 *         contactBilling:
 *           type: object
 *           description: Datos de contacto Billing
 *
 *     RenewDomainPayload:
 *       type: object
 *       required:
 *         - domain
 *         - period
 *       properties:
 *         domain:
 *           type: string
 *           description: Dominio a renovar
 *           example: 'example.com'
 *         period:
 *           type: integer
 *           description: Años a renovar
 *           example: 1
 *         renewAuto:
 *           type: boolean
 *           description: Activa o no la renovación automática
 *           example: true
 *
 *     CheckAvailabilityPayload:
 *       type: object
 *       required:
 *         - domain
 *       properties:
 *         domain:
 *           type: string
 *           description: Dominio a chequear disponibilidad
 *           example: 'example.com'
 *
 *     Certificate:
 *       type: object
 *       properties:
 *         id_certificado:
 *           type: integer
 *           description: ID interno autoincremental de la tabla Certificado
 *           example: 1
 *         id_servicio:
 *           type: integer
 *           description: Relación con la tabla Servicio
 *           example: 10
 *         goDaddyCertificateId:
 *           type: string
 *           description: ID del certificado en GoDaddy (opcional, si es emitido en GoDaddy)
 *           example: "ABC123XYZ"
 *         productType:
 *           type: string
 *           description: Tipo de certificado (DV_SSL, OV_SSL, EV_SSL, etc.)
 *           example: "DV_SSL"
 *         commonName:
 *           type: string
 *           description: Dominio principal (commonName) para el certificado
 *           example: "misitio.com"
 *         subjectAlternativeNames:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de SAN (Subject Alt Names)
 *           example: ["www.misitio.com"]
 *         period:
 *           type: integer
 *           description: Años de validez (1, 2, 3, etc.)
 *           example: 1
 *         csr:
 *           type: string
 *           description: CSR del certificado (si el usuario gestiona externamente la llave)
 *           example: "-----BEGIN CERTIFICATE REQUEST-----\nMIIB..."
 *         estadoCertificado:
 *           type: string
 *           description: Estado local del certificado (Pendiente, Emitido, Revocado, etc.)
 *           example: "Pendiente"
 *         fechaEmision:
 *           type: string
 *           format: date-time
 *           description: Fecha en que el certificado fue emitido
 *           example: "2023-05-01T12:00:00Z"
 *         fechaExpiracion:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del certificado
 *           example: "2024-05-01T12:00:00Z"
 *         callbackUrl:
 *           type: string
 *           description: URL para WebHook (callback) si se usa notificaciones
 *           example: "https://miapp.com/certificados/callback"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación en la BD local
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2023-01-02T15:00:00Z"
 */
