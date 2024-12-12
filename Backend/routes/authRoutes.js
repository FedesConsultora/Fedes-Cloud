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
import passport, { generateJWT } from '../config/passport.js';
import crypto from 'crypto'; // Asegúrate de importar crypto
import { Op } from 'sequelize'; // Asegúrate de importar Op
import { Usuario } from '../models/index.js';
import speakeasy from 'speakeasy';


const router = Router();

// Registro local
router.post('/register', registerValidation, authController.register);


router.post('/login', loginValidation, (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info?.message || 'Credenciales inválidas' });
    }

    if (user.twoFactorEnabled) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tempTokenExpires = Date.now() + (10 * 60 * 1000);
      user.twoFactorTempToken = tempToken;
      user.twoFactorTempExpires = tempTokenExpires;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Se requiere autenticación de dos factores.',
        twoFactorRequired: true,
        tempToken,
      });
    } else {
      const token = generateJWT(user);
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? 'None' : 'Lax', // 'None' si es https en prod
        maxAge: 60 * 60 * 1000,
      };
      res.cookie('token', token, cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        twoFactorEnabled: user.twoFactorEnabled,
      });
    }
  })(req, res, next);
});

router.post('/login-2fa', async (req, res, next) => {
  const { tempToken, twoFactorToken } = req.body;
  console.log('entre a login-2fa')
  if (!tempToken || !twoFactorToken) {
    return res.status(400).json({ success: false, message: 'Token temporal y código de 2FA son obligatorios.' });
  }

  try {
    const user = await Usuario.findOne({
      where: {
        twoFactorTempToken: tempToken,
        twoFactorTempExpires: { [Op.gt]: Date.now() },
      },
    });
    console.log('pase');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token temporal inválido o expirado.' });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA no está habilitada para este usuario.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 1,
    });

    if (verified) {
      user.twoFactorTempToken = null;
      user.twoFactorTempExpires = null;
      await user.save();

      const token = generateJWT(user);
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000,
      };
      res.cookie('token', token, cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso con 2FA.',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Código de 2FA inválido.' });
    }
  } catch (error) {
    console.error('Error capturado en login-2fa:', error);
    logger.error(`Error en verificación de 2FA: ${error.message}`);
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, authController.getProfile);

// Confirmación de email
router.get('/confirm-email', authController.confirmEmail);
router.post('/resend-confirm-email', authController.resendConfirmEmail);

// Password Reset
router.post('/request-password-reset', requestPasswordResetValidation, authController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.post('/resend-password-reset', resendPasswordResetValidation, authController.resendPasswordReset);

// Google OAuth: Iniciar
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google OAuth: Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login', session: false }), (req, res) => {
  // Aquí req.user ya está autenticado
  const token = generateJWT(req.user);
  // Establecer la cookie HTTP-only
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true en producción
    sameSite: 'None', // Ajusta según tu necesidad
    maxAge: 60 * 60 * 1000, // 1 hora
  });
  // Redirigir al frontend
  res.redirect('http://localhost:3000'); // Cambia esto a tu URL de frontend en producción
});

// 2FA Routes
router.post('/enable-2fa', authMiddleware, authController.enableTwoFactor);
router.post('/verify-2fa', authMiddleware, authController.verifyTwoFactor);
router.post('/disable-2fa', authMiddleware, authController.disableTwoFactor);

export default router;