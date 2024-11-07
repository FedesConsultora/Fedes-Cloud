// utils/errors/GeneralErrors.js
import CustomError from '../CustomError.js';

// Error para recursos no encontrados
export class NotFoundError extends CustomError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

// Error para acceso no autorizado
export class UnauthorizedError extends CustomError {
  constructor(message = 'Acceso no autorizado') {
    super(401, message);
  }
}

// Error para permisos insuficientes
export class PermissionDeniedError extends CustomError {
  constructor(message = 'Permisos insuficientes') {
    super(403, message);
  }
}

// Error para conflictos (e.g., duplicados)
export class ConflictError extends CustomError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(409, message);
  }
}

// Error de validación
export class ValidationError extends CustomError {
  constructor(errors) {
    super(400, 'Errores de validación', errors);
  }
}
