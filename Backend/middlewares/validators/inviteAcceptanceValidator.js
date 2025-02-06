// middlewares/validators/inviteAcceptanceValidator.js
import { body, query } from 'express-validator';

export const acceptInvitationValidator = [
  // Validar y sanitizar los campos en el body
  body('token')
    .exists({ checkFalsy: true }).withMessage('El token es obligatorio.')
    .trim(),
  body('email')
    .exists({ checkFalsy: true }).withMessage('El email es obligatorio.')
    .isEmail().withMessage('Debe ser un email válido.')
    .normalizeEmail(),
  body('newPassword')
    .if(body('newPassword').exists())
    .trim()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('nombre')
    .if(body('nombre').exists())
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.'),
  body('apellido')
    .if(body('apellido').exists())
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio.'),
  body('fechaNacimiento')
    .if(body('fechaNacimiento').exists())
    .isISO8601().withMessage('La fecha de nacimiento debe estar en formato YYYY-MM-DD.'),
];
