// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors/GeneralErrors.js';
import { Usuario } from '../models/index.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica si el encabezado de autorización está presente y tiene el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token de autenticación faltante o inválido'));
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica y decodifica el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca al usuario en la base de datos
    const user = await Usuario.findByPk(decoded.id_usuario, {
      include: ['Rol', 'Estado', 'Autenticacion'], // Ajusta según tus asociaciones
    });

    if (!user) {
      return next(new UnauthorizedError('Usuario no encontrado'));
    }

    // Adjunta la información del usuario al objeto de la solicitud
    req.user = {
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      permisos: user.Rol.permisos.map((permiso) => permiso.nombre), // Ajusta según tu estructura
    };

    next();
  } catch (error) {
    return next(new UnauthorizedError('Token de autenticación inválido'));
  }
};

export default authMiddleware;