// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors/GeneralErrors.js';
import { Usuario, Rol, Permiso, Estado, Autenticacion, Accion } from '../models/index.js'; // Importa todos los modelos necesarios
import logger from '../utils/logger.js';

const authMiddleware = async (req, res, next) => {
  // Obtener el token desde las cookies
  const token = req.cookies.token;

  // Verifica si el token está presente
  if (!token) {
    return next(new UnauthorizedError('Token de autenticación faltante o inválido'));
  }

  try {
    logger.info(`El token entrante es: ${token}`);
    logger.debug(`JWT_SECRET utilizado para verificar: ${process.env.JWT_SECRET}`);

    // Verifica y decodifica el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca al usuario en la base de datos, incluyendo Rol y Permisos
    const user = await Usuario.findByPk(decoded.id_usuario, {
      include: [
        {
          model: Rol,
          as: 'Rol',
          include: [
            {
              model: Permiso,
              as: 'permisos', // Debe coincidir con el alias definido en la asociación
              through: { attributes: [] }, // Excluye atributos de la tabla intermedia
              include: [
                {
                  model: Accion,
                  as: 'acciones', // Incluye las acciones asociadas a cada permiso
                },
              ],
            },
          ],
        },
        {
          model: Estado,
          as: 'Estado',
        },
        {
          model: Autenticacion,
          as: 'Autenticacion',
        },
      ],
    });

    if (!user) {
      return next(new UnauthorizedError('Usuario no encontrado'));
    }

    // Convierte el objeto Sequelize en un objeto plano
    const userData = user.toJSON();
    console.log(userData);
    // Verifica que el rol tenga permisos
    if (!userData.Rol || !Array.isArray(userData.Rol.permisos)) {
      logger.error(`El rol del usuario no tiene permisos asociados.`);
      return next(new UnauthorizedError('Permisos de usuario inválidos'));
    }

    // Adjunta la información del usuario al objeto de la solicitud
    req.user = {
      id: userData.id_usuario,
      nombre: userData.nombre,
      email: userData.email,
      permisos: userData.Rol.permisos.map((permiso) => permiso.nombre),
    };

    next();
  } catch (error) {
    logger.error(`Error en verificación del token: ${error.message}`);
    return next(new UnauthorizedError('Token de autenticación inválido'));
  }
};

export default authMiddleware;