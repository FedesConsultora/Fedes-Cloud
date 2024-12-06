// routes/authRoutes.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
  resendPasswordResetValidation,
} from '../middlewares/validators/authValidator.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register' ,registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

router.post('/logout', authMiddleware, authController.logout); // Ruta protegida
router.get('/profile', authMiddleware, authController.getProfile); // Nueva ruta protegida

// Ruta para confirmar el correo electrónico
router.get('/confirm-email', authController.confirmEmail);

router.post('/resend-confirm-email', authController.resendConfirmEmail);

// Ruta para solicitar restablecimiento de contraseña
router.post('/request-password-reset', requestPasswordResetValidation, authController.requestPasswordReset);

// Ruta para restablecer la contraseña
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

router.post('/resend-password-reset', resendPasswordResetValidation, authController.resendPasswordReset);

export default router;
