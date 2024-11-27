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
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder los 50 caracteres')
    .escape(),

  // Validación para el campo 'apellido'
  body('apellido')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder los 50 caracteres')
    .escape(),

  // Validación para el campo 'email'
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder los 100 caracteres'),

  // Validación para el campo 'contraseña'
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)')
    .escape(),

  // Validación para el campo 'fechaNacimiento'
  body('fechaNacimiento')
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Debe ser una fecha válida en formato YYYY-MM-DD')
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        throw new Error('Debe ser mayor de 18 años para registrarse');
      }
      return true;
    }),

  // Validación para el campo 'id_autenticacion'
  body('id_autenticacion')
    .isInt({ gt: 0 })
    .withMessage('El ID de autenticación debe ser un número entero positivo'),

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
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder los 100 caracteres'),

  // Validación para el campo 'contraseña'
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
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

export const requestPasswordResetValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder los 100 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('El token es obligatorio'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array()));
    }
    next();
  },
];
