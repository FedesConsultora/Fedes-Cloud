import { Pago, Orden } from '../models/index.js';
import logger from '../utils/logger.js';

export const createPago = async (req, res, next) => {
  try {
    const { id_orden, monto, metodoPago, transaccionId } = req.body;

    // Verificar que la orden pertenece al usuario
    const orden = await Orden.findOne({
      where: { id_orden, id_usuario: req.user.id_usuario }
    });
    if (!orden) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada o no pertenece al usuario' });
    }

    const nuevoPago = await Pago.create({
      id_orden,
      id_usuario: req.user.id_usuario,
      monto,
      moneda: orden.moneda, // asume la misma moneda de la orden
      metodoPago,
      transaccionId,
      estadoPago: 'pendiente',
    });

    res.status(201).json({ success: true, data: nuevoPago });
  } catch (error) {
    logger.error(`Error al crear pago: ${error.message}`);
    next(error);
  }
};

export const getPagosByOrden = async (req, res, next) => {
  try {
    const { id_orden } = req.params;
    // Verificar orden
    const orden = await Orden.findOne({
      where: { id_orden, id_usuario: req.user.id_usuario }
    });
    if (!orden) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    const pagos = await Pago.findAll({ where: { id_orden } });
    res.status(200).json({ success: true, data: pagos });
  } catch (error) {
    logger.error(`Error al obtener pagos: ${error.message}`);
    next(error);
  }
};

export const confirmarPago = async (req, res, next) => {
  try {
    const { id_pago } = req.params;
    const pago = await Pago.findOne({
      where: { id_pago, id_usuario: req.user.id_usuario },
    });
    if (!pago) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }
    // Cambiamos su estado
    await pago.update({
      estadoPago: 'aprobado',
      fechaPago: new Date(),
    });
    // Podrías también actualizar la Orden a 'pagado' si se cubrió el total
    res.status(200).json({ success: true, message: 'Pago confirmado exitosamente.', data: pago });
  } catch (error) {
    logger.error(`Error al confirmar pago: ${error.message}`);
    next(error);
  }
};

export const getAllPagosAdmin = async (req, res, next) => {
    try {
      // Valida rol admin (puedes usar un helper o chequear un campo en req.user)
      if (!isAdmin(req.user)) {
        throw new PermissionDeniedError('No tienes permisos de administrador para ver todos los pagos.');
      }
  
      const todosLosPagos = await Pago.findAll({
        include: [
          { model: Orden, as: 'orden' },
        ],
        order: [['createdAt', 'DESC']],
      });
  
      res.status(200).json({
        success: true,
        data: todosLosPagos,
      });
    } catch (error) {
      logger.error(`Error al obtener todos los pagos: ${error.message}`);
      next(error);
    }
  };
  
  /**
   * (3.6) Webhook para recibir notificaciones de la pasarela de pago (endpoint público)
   * POST /pagos/webhook
   */
  export const webhookPagoCallback = async (req, res, next) => {
    try {
      // NO uses authMiddleware si la pasarela de pago no envía un token Bearer
      // En su lugar, valida la firma/hashing que provea la pasarela.
  
      // 1) Recibir la data del webhook (puede variar según Stripe, PayPal, MercadoPago, etc.)
      const payload = req.body; 
      logger.info(`Webhook recibido: ${JSON.stringify(payload)}`);
  
      // 2) Verificar la firma/hashing si tu pasarela lo provee (muy recomendable).
      // Ej: Stripe -> header 'stripe-signature'; 
      // MercadoPago -> en la query param 'data.id' y un secret.
      // if (!verifySignature(req.headers, payload)) {
      //   return res.status(400).json({ success: false, message: 'Firma inválida' });
      // }
  
      // 3) Con la info del webhook, busca el pago y actualiza su estado.
      //    Esto depende del formato real de la pasarela.
      // Ejemplo pseudo-lógica:
      // const { external_reference, status, transaction_id } = payload;
      // const pago = await Pago.findOne({ where: { transaccionId: external_reference } });
      // if (!pago) { ... }
  
      // 4) Actualizar pago:
      // if (status === 'approved') {
      //   await pago.update({ estadoPago: 'aprobado', fechaPago: new Date() });
      //   // Podrías también setear la Orden como 'pagado' si corresponde
      // }
  
      // 5) Retornar 200 o 201 para que la pasarela sepa que se procesó el webhook.
      return res.status(200).json({ success: true, message: 'Webhook procesado correctamente.' });
    } catch (error) {
      logger.error(`Error en webhookPagoCallback: ${error.message}`);
      next(error);
    }
  };
  