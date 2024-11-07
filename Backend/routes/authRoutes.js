// routes/authRoutes.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middlewares/validators/authValidator.js'; // Importa desde authValidator.js

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', registerValidation, authController.register);

// Ruta para iniciar sesión
router.post('/login', loginValidation, authController.login);

export default router;
