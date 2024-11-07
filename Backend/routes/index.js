// routes/index.js
import { Router } from 'express';
const router = Router();

import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import authRoutes from './authRoutes.js';

router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/auth', authRoutes);

router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Fedes Cloud!');
});

export default router;

