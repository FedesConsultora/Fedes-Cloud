// routes/authRoutes.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middlewares/validators/authValidator.js';

const router = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

export default router;
