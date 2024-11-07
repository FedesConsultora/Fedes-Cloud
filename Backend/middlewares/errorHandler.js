// middlewares/errorHandler.js
export default (err, req, res, next) => {
    console.error(err.stack);
  
    const statusCode = err.status || 500;
    const message = err.message || 'Error interno del servidor';
  
    res.status(statusCode).json({
      success: false,
      message,
    });
  };
  