// routes/authRoutes.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
} from '../middlewares/validators/authValidator.js';

const router = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Ruta para confirmar el correo electrónico
router.get('/confirm-email', authController.confirmEmail);

// Ruta para solicitar restablecimiento de contraseña
router.post('/request-password-reset', requestPasswordResetValidation, authController.requestPasswordReset);

// Ruta para restablecer la contraseña
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

export default router;
