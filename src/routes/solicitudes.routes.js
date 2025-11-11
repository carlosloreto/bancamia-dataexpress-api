/**
 * Rutas del módulo de solicitudes de crédito
 */

import express from 'express';
import * as solicitudesController from '../controllers/solicitudes.controller.js';
import { asyncHandler } from '../lib/errors.js';

const router = express.Router();

// Log para verificar que las rutas se registran
console.log('✅ Ruta POST /solicitudes registrada');

// POST /api/v1/solicitudes - Crear una nueva solicitud de crédito
router.post('/', asyncHandler(solicitudesController.createSolicitud));

// GET /api/v1/solicitudes - Obtener todas las solicitudes
router.get('/', asyncHandler(solicitudesController.getAllSolicitudes));

// GET /api/v1/solicitudes/:id - Obtener una solicitud por ID
router.get('/:id', asyncHandler(solicitudesController.getSolicitudById));

// PUT /api/v1/solicitudes/:id - Actualizar una solicitud
router.put('/:id', asyncHandler(solicitudesController.updateSolicitud));

// DELETE /api/v1/solicitudes/:id - Eliminar una solicitud
router.delete('/:id', asyncHandler(solicitudesController.deleteSolicitud));

export default router;

