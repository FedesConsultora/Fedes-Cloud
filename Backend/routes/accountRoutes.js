// routes/accountRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { accessParentAccount, switchBackToChild } from '../controllers/accountController.js';

const router = Router();

// Endpoint para que un hijo acceda a la cuenta de un padre
// Se espera el parámetro :parentId en la URL
router.get('/:parentId/acceder', authMiddleware, accessParentAccount);
router.get('/switch-back', authMiddleware, switchBackToChild);
export default router;
