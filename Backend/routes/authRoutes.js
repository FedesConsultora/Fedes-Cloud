// routes/authRoutes.js
import { Router } from 'express';
const router = Router();
import * as authController from '../controllers/authController.js';

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para registrar un nuevo usuario
router.post('/register', authController.register);

export default router;
