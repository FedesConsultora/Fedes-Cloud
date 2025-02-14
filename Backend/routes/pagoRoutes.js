import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as pagoController from '../controllers/pagoController.js';

const router = Router();

// Crear un pago (por ejemplo, si se paga en parcialidades)
router.post('/', authMiddleware, pagoController.createPago);

// Obtener todos los pagos de la orden
router.get('/orden/:id_orden', authMiddleware, pagoController.getPagosByOrden);

// Confirmar (o aprobar) un pago
router.put('/:id_pago/confirm', authMiddleware, pagoController.confirmarPago);

// (3.5) Ver todos los pagos (solo admin)
router.get('/all', authMiddleware, pagoController.getAllPagosAdmin);

// (3.6) Webhook de la pasarela de pago (PÚBLICO, sin authMiddleware)
router.post('/webhook', pagoController.webhookPagoCallback);


export default router;
