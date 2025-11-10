/**
 * Controlador de usuarios
 * Maneja la lógica de negocio para operaciones de usuarios
 */

import * as usersService from '../services/users.service.js';
import { ValidationError, NotFoundError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  logger.info('Obteniendo lista de usuarios', { page, limit, search });
  
  const result = await usersService.getUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });
  
  res.status(200).json({
    success: true,
    data: result.users,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  
  logger.info('Obteniendo usuario por ID', { id });
  
  const user = await usersService.getUserById(id);
  
  if (!user) {
    throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
};

/**
 * Crear un nuevo usuario
 */
export const createUser = async (req, res) => {
  const userData = req.body;
  
  // Validación básica
  if (!userData.name || !userData.email) {
    throw new ValidationError('Los campos name y email son requeridos', {
      fields: ['name', 'email']
    });
  }
  
  logger.info('Creando nuevo usuario', { email: userData.email });
  
  const newUser = await usersService.createUser(userData);
  
  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: newUser
  });
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  logger.info('Actualizando usuario', { id, fields: Object.keys(updateData) });
  
  const updatedUser = await usersService.updateUser(id, updateData);
  
  if (!updatedUser) {
    throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
  }
  
  res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: updatedUser
  });
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  logger.info('Eliminando usuario', { id });
  
  const deleted = await usersService.deleteUser(id);
  
  if (!deleted) {
    throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
  }
  
  res.status(200).json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  });
};


