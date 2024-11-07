// utils/errors/UserErrors.js
import { NotFoundError, ConflictError } from './GeneralErrors.js';
import CustomError from '../CustomError.js';

// Error cuando un usuario no es encontrado
export class UserNotFoundError extends NotFoundError {
  constructor(message = 'Usuario no encontrado') {
    super(message);
  }
}

// Error cuando las credenciales son inválidas
export class InvalidCredentialsError extends CustomError {
  constructor(message = 'Credenciales inválidas') {
    super(401, message);
  }
}

// Error cuando el email ya está registrado
export class EmailAlreadyExistsError extends ConflictError {
  constructor(message = 'El email ya está registrado') {
    super(message);
  }
}
