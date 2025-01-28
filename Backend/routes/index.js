// routes/index.js
import { Router } from 'express';
const router = Router();

import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import authRoutes from './authRoutes.js';
import permisoRoutes from './permisoRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import dominioRoutes from './dominioRoutes.js';
import contactRoutes from './contactRoutes.js';

/**
 * @swagger
 * tags:
 *   name: Base
 *   description: Ruta base de la API
 */
 
// Nota: La documentación de la ruta base está ahora en `docs/baseDocs.js`

router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Fedes Cloud!');
});

// Ruta de autenticación (no protegida)
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permisos', permisoRoutes);
router.use('/services', serviceRoutes)
router.use('/dominios', dominioRoutes); 
router.use('/user-contact', contactRoutes);

export default router;
