// routes/userCompositeRoutes.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as userCompositeController from '../controllers/userCompositeController.js';
import { acceptInvitationValidator } from '../middlewares/validators/inviteAcceptanceValidator.js';

const router = Router();

router.post('/invite', authMiddleware, userCompositeController.inviteUser);
// Endpoint para desvincular un subusuario (manteniendo su cuenta original)
router.put('/:id/unlink', authMiddleware, userCompositeController.unlinkSubUser);

router.get('/subusuarios', authMiddleware, userCompositeController.getSubUsers);


router.get('/check-email', authMiddleware, userCompositeController.checkEmail);


// Ruta para obtener los datos de la(s) cuenta(s) padre a la que el usuario está vinculado
router.get('/parents', authMiddleware, userCompositeController.getParentAccounts);
router.get('/invitaciones', authMiddleware, userCompositeController.getPendingInvitations);
router.get('/invite/accept', userCompositeController.getInvitationDetails);
router.post('/invite/accept', acceptInvitationValidator , userCompositeController.acceptInvitation);

export default router;
