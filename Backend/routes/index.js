// routes/index.js
import { Router } from 'express';
const router = Router();

import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import authRoutes from './authRoutes.js';

// Ruta de autenticación (no protegida)
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

// Ruta base de la API
router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Fedes Cloud!');
});

export default router;
