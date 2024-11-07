// middlewares/errorHandler.js
import CustomError from '../utils/CustomError.js';
import logger from '../utils/logger.js'; // Configuración de Winston

export default (err, req, res, next) => {
  // Log del error utilizando Winston
  logger.error(err);

  // Inicializar variables de respuesta
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || [];

  // Manejo de errores personalizados
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Errores de validación';
    errors = err.errors.map((e) => ({ message: e.message, field: e.path }));
  } else {
    // Otros errores no manejados específicamente
    message = 'Error interno del servidor';
  }

  // En producción, ocultar detalles de errores internos
  if (process.env.NODE_ENV === 'production') {
    errors = [];
    if (statusCode === 500) {
      message = 'Error interno del servidor';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
