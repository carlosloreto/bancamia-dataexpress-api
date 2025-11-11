/**
 * Rutas del módulo de autenticación
 */

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { loginRateLimit, registerRateLimit } from '../middleware/rate-limit.middleware.js';
import { asyncHandler } from '../lib/errors.js';

const router = express.Router();

// POST /api/v1/auth/login - Login con token de Firebase Auth (con rate limiting)
router.post('/login', loginRateLimit, asyncHandler(authController.login));

// POST /api/v1/auth/register - Registro de nuevo usuario (con rate limiting)
router.post('/register', registerRateLimit, asyncHandler(authController.register));

// POST /api/v1/auth/verify - Verificar token
router.post('/verify', asyncHandler(authController.verify));

// GET /api/v1/auth/me - Obtener perfil del usuario autenticado (requiere auth)
router.get('/me', authenticateToken, asyncHandler(authController.getMe));

// POST /api/v1/auth/refresh - Renovar token (opcional)
router.post('/refresh', asyncHandler(authController.refresh));

export default router;

