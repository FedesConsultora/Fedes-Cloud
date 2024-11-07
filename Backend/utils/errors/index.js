// utils/errors/index.js

// Errores Generales
export { ValidationError, NotFoundError, UnauthorizedError, PermissionDeniedError, ConflictError } from './GeneralErrors.js';

// Errores de Usuarios
export { UserNotFoundError, InvalidCredentialsError, EmailAlreadyExistsError } from './UserErrors.js';

// Errores de Roles
export { RoleNotFoundError, RoleNameExistsError } from './RoleErrors.js';

// Errores de Permisos
export { PermissionNotFoundError, PermissionNameExistsError } from './PermissionErrors.js';

// Errores de Acciones
export { ActionNotFoundError, ActionNameExistsError } from './ActionErrors.js';

// Errores de Autenticaciones
export { AuthMethodNotFoundError, AuthTypeExistsError } from './AuthErrors.js';

// Agrega más exportaciones según sea necesario
