// utils/errors/AuthErrors.js
import { NotFoundError, ConflictError } from './GeneralErrors.js';

// Error cuando un método de autenticación no es encontrado
export class AuthMethodNotFoundError extends NotFoundError {
  constructor(message = 'Método de autenticación no encontrado') {
    super(message);
  }
}

// Error cuando el tipo de autenticación ya existe
export class AuthTypeExistsError extends ConflictError {
  constructor(message = 'El tipo de autenticación ya existe') {
    super(message);
  }
}
