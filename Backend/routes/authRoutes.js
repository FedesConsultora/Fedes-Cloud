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
import crypto from 'crypto';
import { Op } from 'sequelize';
import { Usuario,  } from '../models/index.js';
import speakeasy from 'speakeasy';


const router = Router();

const isProduction = process.env.NODE_ENV === 'production';

// Registro local
router.post('/register', registerValidation, authController.register);

// Login local (ya existente)
router.post('/login', loginValidation, async (req, res, next) => {
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
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000,
      };
      res.cookie('token', token, cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        twoFactorEnabled: user.twoFactorEnabled,
        token: token,
      });
    }
  })(req, res, next);
});

// Verificación de 2FA
router.post('/login-2fa', async (req, res, next) => {
  const { tempToken, twoFactorToken } = req.body;
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

router.get('/google', (req, res, next) => {
  // Guardamos el clientURI en session o en una cookie temporal (si usas session)
  // Si no tienes sesiones habilitadas, puedes pasarlo en state:
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
  async (req, res) => {
    // Aquí req.user ya está autenticado con Google
    const clientURI = req.query.state ? decodeURIComponent(req.query.state) : 'http://localhost:3000';

    // Verificar 2FA
    if (req.user.twoFactorEnabled) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tempTokenExpires = Date.now() + (10 * 60 * 1000);
      req.user.twoFactorTempToken = tempToken;
      req.user.twoFactorTempExpires = tempTokenExpires;
      await req.user.save();
      // Redirigir al frontend con los parámetros para que muestre la ventana de 2FA
      // Por ejemplo, el frontend podría leer estos query params para mostrar TwoFactorAuth
      return res.redirect(`${clientURI}/auth/login?twoFactorRequired=true&tempToken=${tempToken}`);
    } else {
      // Sin 2FA: generamos el token JWT y la cookie
      const token = generateJWT(req.user);
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000,
      };
      res.cookie('token', token, cookieOptions);
      // Redirigir al frontend
      return res.redirect(clientURI);
    }
  }
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
router.put('/update-password', authMiddleware, authController.updatePassword);

export default router;
