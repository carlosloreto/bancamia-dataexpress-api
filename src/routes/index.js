/**
 * Router principal de la API
 * Centraliza todas las rutas de los módulos
 */

import express from 'express';
import usersRoutes from './users.routes.js';

const router = express.Router();

// =====================================
// Ruta de bienvenida de la API
// =====================================
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a Bancamia DataExpress API',
    version: 'v1',
    endpoints: {
      users: '/users',
      health: '/health'
    }
  });
});

// =====================================
// Rutas de módulos
// =====================================
router.use('/users', usersRoutes);

// Agregar más rutas aquí según sea necesario
// router.use('/products', productsRoutes);
// router.use('/orders', ordersRoutes);

export default router;


