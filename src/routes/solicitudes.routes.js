/**
 * Rutas del módulo de solicitudes de crédito
 */

import express from 'express';
import * as solicitudesController from '../controllers/solicitudes.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadPDF, handleUploadErrors, requirePDF } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../lib/errors.js';

const router = express.Router();

// Log para verificar que las rutas se registran
console.log('✅ Ruta POST /solicitudes registrada');

// POST /api/v1/solicitudes - Crear una nueva solicitud de crédito (público, sin auth)
// Requiere multipart/form-data con campo 'documento' (PDF obligatorio)
router.post('/', 
  uploadPDF,
  handleUploadErrors,
  requirePDF,
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

