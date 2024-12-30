import { body, param, validationResult } from 'express-validator';
import { ValidationError } from '../../utils/errors/GeneralErrors.js';

/**
 * Validación para crear un nuevo servicio.
 */
export const createServiceValidation = [
  // Validación para el campo 'nombre'
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del servicio es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre del servicio no puede exceder los 50 caracteres')
    .escape(),

  // Validación para el campo 'estado'
  body('estado')
    .trim()
    .notEmpty()
    .withMessage('El estado del servicio es obligatorio')
    .isIn(['activo', 'inactivo', 'pendiente'])
    .withMessage('El estado debe ser activo, inactivo o pendiente'),

  // Validación para el campo 'id_usuario'
  body('id_usuario')
    .notEmpty()
    .withMessage('El ID del usuario es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];

/**
 * Validación para obtener un servicio por ID.
 */
export const getServiceByIdValidation = [
  // Validación para el parámetro 'id_servicio'
  param('id_servicio')
    .notEmpty()
    .withMessage('El ID del servicio es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del servicio debe ser un número entero positivo'),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];

/**
 * Validación para actualizar un servicio existente.
 */
export const updateServiceValidation = [
  // Validación para el parámetro 'id_servicio'
  param('id_servicio')
    .notEmpty()
    .withMessage('El ID del servicio es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del servicio debe ser un número entero positivo'),

  // Validación para el campo 'nombre'
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre del servicio no puede estar vacío')
    .isLength({ max: 50 })
    .withMessage('El nombre del servicio no puede exceder los 50 caracteres')
    .escape(),

  // Validación para el campo 'estado'
  body('estado')
    .optional()
    .trim()
    .isIn(['activo', 'inactivo', 'pendiente'])
    .withMessage('El estado debe ser activo, inactivo o pendiente'),

  // Validación para el campo 'id_usuario'
  body('id_usuario')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];

/**
 * Validación para eliminar un servicio.
 */
export const deleteServiceValidation = [
  // Validación para el parámetro 'id_servicio'
  param('id_servicio')
    .notEmpty()
    .withMessage('El ID del servicio es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del servicio debe ser un número entero positivo'),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];
