// utils/CustomError.js
export default class CustomError extends Error {
    constructor(statusCode, message, errors = []) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors; // Detalles adicionales sobre el error
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  