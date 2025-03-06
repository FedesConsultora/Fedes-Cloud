import { Router } from 'express';
const router = Router();

import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import authRoutes from './authRoutes.js';
import permisoRoutes from './permisoRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import dominioRoutes from './dominioRoutes.js';
import contactRoutes from './userContactRoutes.js';
import billingRoutes from './userBillingRoutes.js';
import certificadoRoutes from './certificadoRoutes.js';
import userCompositeRoutes from './userCompositeRoutes.js';
import accountRoutes from './accountRoutes.js';
import ordenRoutes from './ordenRoutes.js';
import ordenDetalleRoutes from './ordenDetalleRoutes.js';
import ordenDetalleHistorialRoutes from './ordenDetalleHistorialRoutes.js';
import pagoRoutes from './pagoRoutes.js';
import estadoOrdenRoutes from './estadoOrdenRoutes.js';
import estadoHostingRoutes from './estadoHostingRoutes.js';
import hostingRoutes from './hostingRoutes.js';
import cartRoutes from './cartRoutes.js';
import cartItemRoutes from './cartItemRoutes.js';
import cartItemAddonRoutes from './cartItemAddonRoutes.js';
import CatalogoComplementosRoutes from './CatalogoComplementosRoutes.js';
import impuestoRoutes from './impuestoRoutes.js';


/**
 * @swagger
 * tags:
 *   name: Base
 *   description: Ruta base de la API
 */

router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Fedes Cloud!');
});

// Rutas de autenticación (no protegidas)
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permisos', permisoRoutes);
router.use('/services', serviceRoutes);
router.use('/dominios', dominioRoutes);
router.use('/user-billing', billingRoutes);
router.use('/user-contact', contactRoutes);
router.use('/user-composite', userCompositeRoutes);
router.use('/certificados', certificadoRoutes);
router.use('/cuentas', accountRoutes);
router.use('/ordenes', ordenRoutes);
router.use('/orden-detalles', ordenDetalleRoutes);
router.use('/orden-detalles/historial', ordenDetalleHistorialRoutes);
router.use('/pagos', pagoRoutes);
router.use('/estado-orden', estadoOrdenRoutes);
router.use('/estado-hosting', estadoHostingRoutes);
router.use('/hosting', hostingRoutes);
router.use('/cart', cartRoutes);
router.use('/cart-items', cartItemRoutes);
router.use('/cart-item-addons', cartItemAddonRoutes);
router.use('/catalogo-complementos', CatalogoComplementosRoutes);
router.use('/impuestos', impuestoRoutes);



export default router;
