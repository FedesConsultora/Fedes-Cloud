// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Se espera el formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado: se requiere un token de autenticación',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};
