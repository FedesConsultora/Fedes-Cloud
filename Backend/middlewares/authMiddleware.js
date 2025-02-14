// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors/GeneralErrors.js';
import { Usuario, Rol, Permiso, Estado, Autenticacion, Accion, UsuarioContacto } from '../models/index.js';
import logger from '../utils/logger.js';

const authMiddleware = async (req, res, next) => {
  // Eximir la ruta de confirmación de email
  if (req.path === '/confirm-email') {
    return next();
  }

  // Obtener el token desde las cookies
  const token = req.cookies.token;
  if (!token) {
    return next(new UnauthorizedError('Token de autenticación faltante o inválido'));
  }

  try {
    logger.info(`El token entrante es: ${token}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario (o a la cuenta padre, según el flag) en la base de datos
    const user = await Usuario.findByPk(decoded.id_usuario, {
      include: [
        {
          model: Rol,
          as: 'rol',
          include: [
            {
              model: Permiso,
              as: 'permisos',
              through: { attributes: [] },
            },
          ],
        },
        { model: Estado, as: 'estado' },
        { model: Autenticacion, as: 'autenticacion' },
        { model: UsuarioContacto, as: 'contactos' },
      ],
    });

    if (!user) {
      return next(new UnauthorizedError('Usuario no encontrado'));
    }

    // Armar el objeto req.user; si se está accediendo como padre, se usa la info del token.
    req.user = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      permisos: user.rol?.permisos?.map((permiso) => permiso.nombre) || [],
      accessAsParent: decoded.accessAsParent || false,
      childId: decoded.childId || null,
      subRole: decoded.subRole || user.subRol,
    };

    next();
  } catch (error) {
    logger.error(`Error en verificación del token: ${error.message}`);
    return next(new UnauthorizedError('Token de autenticación inválido'));
  }
};

export default authMiddleware;
