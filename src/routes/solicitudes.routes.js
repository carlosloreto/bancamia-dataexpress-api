/**
 * Rutas del módulo de solicitudes de crédito
 */

import express from 'express';
import * as solicitudesController from '../controllers/solicitudes.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rate-limit.middleware.js';
import { asyncHandler } from '../lib/errors.js';

const router = express.Router();

// Log para verificar que las rutas se registran
console.log('✅ Ruta POST /solicitudes registrada');

// POST /api/v1/solicitudes - Crear una nueva solicitud de crédito (público, sin auth)
// Requiere application/json con los datos de la solicitud
// El PDF se genera automáticamente en el servidor con los datos recibidos
// Protegido con rate limiting estricto: 3 solicitudes por minuto por IP
router.post('/', 
  rateLimit({ 
    windowMs: 60000,      // 1 minuto
    maxRequests: 3,        // Solo 3 solicitudes por minuto
    message: 'Demasiadas solicitudes. Por favor espera un minuto antes de intentar nuevamente.'
  }),
  asyncHandler(solicitudesController.createSolicitud)
);

// GET /api/v1/solicitudes - Obtener todas las solicitudes (requiere auth, filtra por ownership)
router.get('/', authenticateToken, asyncHandler(solicitudesController.getAllSolicitudes));

// GET /api/v1/solicitudes/:id - Obtener una solicitud por ID (requiere auth + ownership)
router.get('/:id', authenticateToken, asyncHandler(solicitudesController.getSolicitudById));

// PUT /api/v1/solicitudes/:id - Actualizar una solicitud (requiere auth + ownership)
router.put('/:id', authenticateToken, asyncHandler(solicitudesController.updateSolicitud));

// DELETE /api/v1/solicitudes/:id - Eliminar una solicitud (requiere auth + ownership)
router.delete('/:id', authenticateToken, asyncHandler(solicitudesController.deleteSolicitud));

export default router;

