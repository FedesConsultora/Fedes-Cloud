// utils/errors/ActionErrors.js
import { NotFoundError, ConflictError } from './GeneralErrors.js';

// Error cuando una acción no es encontrada
export class ActionNotFoundError extends NotFoundError {
  constructor(message = 'Acción no encontrada') {
    super(message);
  }
}

// Error cuando el nombre de la acción ya existe
export class ActionNameExistsError extends ConflictError {
  constructor(message = 'El nombre de la acción ya existe') {
    super(message);
  }
}
