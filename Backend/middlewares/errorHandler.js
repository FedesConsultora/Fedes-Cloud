// middlewares/errorHandler.js
import CustomError from '../utils/CustomError.js';
import logger from '../utils/logger.js'; 

export default (err, req, res, next) => {
  // Log del error
  if (err instanceof CustomError) {
    logger.error(`${err.name}: ${err.message}`, { errors: err.errors });
  } else {
    logger.error(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || [];

  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    // Asegurar que err.errors sea array
    let errorArray = Array.isArray(err.errors) ? err.errors : [{ msg: err.message }];
    // Tomar el primer error para el mensaje principal
    if (errorArray.length > 0 && errorArray[0].msg) {
      message = errorArray[0].msg;
    }
    errors = errorArray.map((error) => ({
      field: error.param || error.field || 'general',
      message: error.msg || error.message || message,
    }));
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    // Tomar el primer error de Sequelize
    if (err.errors.length > 0) {
      message = err.errors[0].message;
    } else {
      message = 'Errores de validación';
    }
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else {
    // Errores no controlados explícitamente
    message = 'Error interno del servidor';
    errors = [];
  }

  // En producción, ocultar detalles internos
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'Error interno del servidor';
    }
    // Si no es un error personalizado, ocultar errores detallados
    if (!(err instanceof CustomError)) {
      errors = [];
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
