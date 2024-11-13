// middlewares/validators/roleValidator.js
import { body, param } from 'express-validator';

export const createRoleValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre del rol es obligatorio')
    .isString().withMessage('El nombre del rol debe ser una cadena de texto'),
  body('permisos')
    .optional()
    .isArray().withMessage('Permisos debe ser un arreglo de nombres de permisos'),
  body('permisos.*')
    .optional()
    .isString().withMessage('Cada permiso debe ser una cadena de texto'),
];

export const getRoleByIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del rol debe ser un entero positivo'),
];

export const updateRoleValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del rol debe ser un entero positivo'),
  body('nombre')
    .optional()
    .notEmpty().withMessage('El nombre del rol no puede estar vacío')
    .isString().withMessage('El nombre del rol debe ser una cadena de texto'),
  body('permisos')
    .optional()
    .isArray().withMessage('Permisos debe ser un arreglo de nombres de permisos'),
  body('permisos.*')
    .optional()
    .isString().withMessage('Cada permiso debe ser una cadena de texto'),
];
