// middlewares/errorHandler.js
import CustomError from '../utils/CustomError.js';
import logger from '../utils/logger.js'; // Configuración de Winston

export default (err, req, res, next) => {
  // Log del error utilizando Winston
  if (err instanceof CustomError) {
    logger.error(`${err.name}: ${err.message}`, { errors: err.errors });
  } else {
    logger.error(err);
  }

  // Inicializar variables de respuesta
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || [];

  // Manejo de errores personalizados
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    // Mapear 'param' y 'msg' a 'field' y 'message' para consistencia en el frontend
    errors = err.errors.map((error) => ({
      field: error.param || error.field, // 'param' de express-validator o 'field' de Sequelize
      message: error.msg || error.message,
    }));
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Errores de validación';
    errors = err.errors.map((e) => ({
      message: e.message,
      field: e.path,
    }));
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
