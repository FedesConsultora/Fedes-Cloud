// middlewares/validators/permisoValidator.js
import { body, param } from 'express-validator';

export const createPermisoValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre del permiso es obligatorio')
    .isString().withMessage('El nombre del permiso debe ser una cadena de texto'),
  body('descripcion')
    .notEmpty().withMessage('La descripción del permiso es obligatoria')
    .isString().withMessage('La descripción del permiso debe ser una cadena de texto'),
];

export const getPermisoByIdValidation = [
  param('id_permiso')
    .isInt({ min: 1 }).withMessage('El ID del permiso debe ser un entero positivo'),
];

export const updatePermisoValidation = [
  param('id_permiso')
    .isInt({ min: 1 }).withMessage('El ID del permiso debe ser un entero positivo'),
  body('nombre')
    .optional()
    .notEmpty().withMessage('El nombre del permiso no puede estar vacío')
    .isString().withMessage('El nombre del permiso debe ser una cadena de texto'),
  body('descripcion')
    .optional()
    .notEmpty().withMessage('La descripción del permiso no puede estar vacía')
    .isString().withMessage('La descripción del permiso debe ser una cadena de texto'),
];

export const deletePermisoValidation = [
  param('id_permiso')
    .isInt({ min: 1 }).withMessage('El ID del permiso debe ser un entero positivo'),
];
