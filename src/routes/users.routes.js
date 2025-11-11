/**
 * Rutas del módulo de usuarios
 */

import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../lib/errors.js';

const router = express.Router();

// GET /api/v1/users/me - Obtener perfil del usuario autenticado (requiere auth)
router.get('/me', authenticateToken, asyncHandler(usersController.getMe));

// GET /api/v1/users - Obtener todos los usuarios (requiere auth + admin)
router.get('/', authenticateToken, requireRole('admin'), asyncHandler(usersController.getAllUsers));

// GET /api/v1/users/:id - Obtener un usuario por ID (requiere auth)
router.get('/:id', authenticateToken, asyncHandler(usersController.getUserById));

// POST /api/v1/users - Crear un nuevo usuario (requiere auth + admin)
router.post('/', authenticateToken, requireRole('admin'), asyncHandler(usersController.createUser));

// PUT /api/v1/users/:id - Actualizar un usuario (requiere auth + ownership o admin)
router.put('/:id', authenticateToken, asyncHandler(usersController.updateUser));

// DELETE /api/v1/users/:id - Eliminar un usuario (requiere auth + admin)
router.delete('/:id', authenticateToken, requireRole('admin'), asyncHandler(usersController.deleteUser));

export default router;


