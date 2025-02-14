import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as detalleController from '../controllers/ordenDetalleController.js';

const router = Router();

// Obtener detalle específico (requiere que la orden sea del usuario)
router.get('/:id_detalle', authMiddleware, detalleController.getDetalleById);

// Asignar un detalle a un usuario interno (tu equipo)
router.put('/:id_detalle/assign', authMiddleware, detalleController.asignarDetalle);

// Cambiar el estado manual (Abierto, Asignado, En Progreso, Finalizado)
router.put('/:id_detalle/estado', authMiddleware, detalleController.cambiarEstadoManual);

// Editar datos (tiempoEstimadoHoras, fechaEstimadaFin, prioridad, metaDatos, etc.)
router.put('/:id_detalle/edit', authMiddleware, detalleController.editarDetalle);

router.post(
    '/:id_orden/detalles',
    authMiddleware,
    detalleController.addDetalleToOrden
  );
  
  /**
   * 2.6. Eliminar un ítem de la orden
   * Endpoint: DELETE /ordenes/:id_orden/detalles/:id_detalle
   */
  router.delete(
    '/:id_orden/detalles/:id_detalle',
    authMiddleware,
    detalleController.removeDetalleFromOrden
  );
  
  /**
   * 2.7. Recalcular subtotal y montoTotal
   * Endpoint: PUT /ordenes/:id_orden/detalles/:id_detalle/recalc
   */
  router.put(
    '/:id_orden/detalles/:id_detalle/recalc',
    authMiddleware,
    detalleController.recalcularSubtotal
  );
  
  /**
   * 2.8. Listar los detalles asignados a mi usuario interno
   * GET /orden-detalles/assigned-to-me
   * => No requiere id_orden, filtra por id_asignado = req.user.id_usuario
   */
  router.get(
    '/assigned-to-me',
    authMiddleware,
    detalleController.listDetallesForAssignedUser
  );

export default router;
