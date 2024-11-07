// middlewares/validators/userValidator.js
import { body, param, validationResult } from 'express-validator';
import { ValidationError } from '../../utils/errors/GeneralErrors.js'; // Asegúrate de que ValidationError esté en GeneralErrors

/**
 * Validación para crear un nuevo usuario (User Module).
 */
export const createUserValidation = [
  // Validación para el campo 'nombre'
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .escape(),

  // Validación para el campo 'apellido'
  body('apellido')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .escape(),

  // Validación para el campo 'email'
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  // Validación para el campo 'contraseña'
  body('contraseña')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .escape(),

  // Validación para el campo 'fechaNacimiento'
  body('fechaNacimiento')
    .isDate()
    .withMessage('Debe ser una fecha válida')
    .toDate(),

  // Validación para el campo 'id_rol'
  body('id_rol')
    .isInt()
    .withMessage('El ID del rol debe ser un número entero'),

  // Validación para el campo 'id_autenticacion'
  body('id_autenticacion')
    .isInt()
    .withMessage('El ID de autenticación debe ser un número entero'),

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
 * Validación para actualizar un usuario (User Module).
 */
export const updateUserValidation = [
  // Validación para el parámetro 'id'
  param('id')
    .isInt()
    .withMessage('El ID del usuario debe ser un número entero'),

  // Validación para el campo 'nombre'
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .escape(),

  // Validación para el campo 'apellido'
  body('apellido')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El apellido no puede estar vacío')
    .escape(),

  // Validación para el campo 'email'
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  // Validación para el campo 'contraseña'
  body('contraseña')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .escape(),

  // Validación para el campo 'fechaNacimiento'
  body('fechaNacimiento')
    .optional()
    .isDate()
    .withMessage('Debe ser una fecha válida')
    .toDate(),

  // Validación para el campo 'id_rol'
  body('id_rol')
    .optional()
    .isInt()
    .withMessage('El ID del rol debe ser un número entero'),

  // Validación para el campo 'id_estado'
  body('id_estado')
    .optional()
    .isInt()
    .withMessage('El ID del estado debe ser un número entero'),

  // Validación para el campo 'id_autenticacion'
  body('id_autenticacion')
    .optional()
    .isInt()
    .withMessage('El ID de autenticación debe ser un número entero'),

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
 * Validación para obtener un usuario por ID (User Module).
 */
export const getUserByIdValidation = [
  // Validación para el parámetro 'id'
  param('id')
    .isInt()
    .withMessage('El ID del usuario debe ser un número entero'),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];