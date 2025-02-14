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
import passport from '../config/passport.js';
import upload from '../config/multerConfig.js';


const router = Router();

const isProduction = process.env.NODE_ENV === 'production';

// Registro local
router.post('/register', registerValidation, authController.register);

// Login local (usando el controlador)
router.post('/login', loginValidation, authController.login);


// Verificación de 2FA
router.post('/login-2fa', authController.loginTwoFactor);

// Ruta para iniciar la autenticación con Google
router.get('/google', (req, res, next) => {
  // Guardamos el clientURI en state para usarlo en el callback
  const { clientURI } = req.query;
  const state = clientURI ? encodeURIComponent(clientURI) : '';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
});

// Google OAuth: Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login', session: false }),
  authController.googleRegister // Llamamos al controlador googleRegister
);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Perfil protegido
router.get('/profile', authMiddleware, authController.getProfile);

// Confirmación de email
router.get('/confirm-email', authController.confirmEmail);
router.post('/resend-confirm-email', authController.resendConfirmEmail);

// Reseteo de contraseña
router.post('/request-password-reset', requestPasswordResetValidation, authController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.post('/resend-password-reset', resendPasswordResetValidation, authController.resendPasswordReset);

// 2FA Routes
router.post('/enable-2fa', authMiddleware, authController.enableTwoFactor);
router.post('/verify-2fa', authMiddleware, authController.verifyTwoFactor);
router.post('/disable-2fa', authMiddleware, authController.disableTwoFactor);

router.put('/update-profile', authMiddleware, authController.updateProfile);
router.put('/update-email', authMiddleware, authController.updateEmail);
router.put('/update-password-email', authMiddleware, authController.updatePasswordEmail);
// La confirmación de cambio de contraseña no requiere autenticación:
router.get('/confirm-password-change', authController.confirmPasswordChange);

// Sube o reemplaza el avatar del usuario autenticado
router.post(
  '/upload-avatar',
  authMiddleware, 
  upload.single('avatar'), // usamos el campo "avatar" del formData
  authController.uploadAvatar // nuevo controlador que implementaremos
);

export default router;
