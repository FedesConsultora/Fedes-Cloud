// utils/errors/PermissionErrors.js
import { NotFoundError, ConflictError } from './GeneralErrors.js';

// Error cuando un permiso no es encontrado
export class PermissionNotFoundError extends NotFoundError {
  constructor(message = 'Permiso no encontrado') {
    super(message);
  }
}

// Error cuando el nombre del permiso ya existe
export class PermissionNameExistsError extends ConflictError {
  constructor(message = 'El nombre del permiso ya existe') {
    super(message);
  }
}
