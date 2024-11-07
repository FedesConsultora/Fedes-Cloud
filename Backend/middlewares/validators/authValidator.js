// middlewares/validators/authValidator.js
import { body, validationResult } from 'express-validator';
import { ValidationError } from '../../utils/errors/GeneralErrors.js'; // Asegúrate de que ValidationError esté en GeneralErrors

/**
 * Validación para el registro de usuarios (Auth Module).
 */
export const registerValidation = [
  // Validación para el campo 'nombre'
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .escape(), // Opcional: Puedes remover .escape() si ya usas xss-clean

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
 * Validación para el inicio de sesión de usuarios (Auth Module).
 */
export const loginValidation = [
  // Validación para el campo 'email'
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  // Validación para el campo 'contraseña'
  body('contraseña')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .escape(),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];
