/**
 * Rutas del módulo de usuarios
 */

import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { asyncHandler } from '../lib/errors.js';

const router = express.Router();

// GET /api/v1/users - Obtener todos los usuarios
router.get('/', asyncHandler(usersController.getAllUsers));

// GET /api/v1/users/:id - Obtener un usuario por ID
router.get('/:id', asyncHandler(usersController.getUserById));

// POST /api/v1/users - Crear un nuevo usuario
router.post('/', asyncHandler(usersController.createUser));

// PUT /api/v1/users/:id - Actualizar un usuario
router.put('/:id', asyncHandler(usersController.updateUser));

// DELETE /api/v1/users/:id - Eliminar un usuario
router.delete('/:id', asyncHandler(usersController.deleteUser));

export default router;


