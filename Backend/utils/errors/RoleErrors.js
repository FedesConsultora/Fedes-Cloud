// utils/errors/RoleErrors.js
import { NotFoundError, ConflictError } from './GeneralErrors.js';

// Error cuando un rol no es encontrado
export class RoleNotFoundError extends NotFoundError {
  constructor(message = 'Rol no encontrado') {
    super(message);
  }
}

// Error cuando el nombre del rol ya existe
export class RoleNameExistsError extends ConflictError {
  constructor(message = 'El nombre del rol ya existe') {
    super(message);
  }
}
