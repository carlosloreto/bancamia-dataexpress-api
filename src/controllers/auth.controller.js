/**
 * Controlador de autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */

import * as authService from '../services/auth.service.js';
import { ValidationError, AuthenticationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { isValidEmail, maskToken } from '../lib/validation.js';

/**
 * POST /api/v1/auth/login
 * Login de usuario con token de Firebase Auth
 */
export const login = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ValidationError('El campo idToken es requerido');
  }

  // Logging seguro (no loggear token completo)
  logger.info('Intento de login', {
    hasToken: !!idToken,
    tokenMask: maskToken(idToken),
    ip: req.ip || req.connection.remoteAddress
  });

  try {
    const result = await authService.login(idToken);

    logger.info('Login exitoso', {
      uid: result.user.firebaseUid || result.user.uid,
      email: result.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    // Log de intento fallido
    logger.warn('Login fallido', {
      error: error.message,
      tokenMask: maskToken(idToken),
      ip: req.ip || req.connection.remoteAddress
    });
    throw error;
  }
};

/**
 * POST /api/v1/auth/register
 * Registro de nuevo usuario
 */
export const register = async (req, res) => {
  const { email, password, name, idToken, role } = req.body;

  // Validación básica
  if (!idToken && !email) {
    throw new ValidationError('El email o idToken es requerido');
  }

  if (!idToken && !password) {
    throw new ValidationError('La contraseña es requerida cuando no se proporciona idToken');
  }

  // Validar formato de email si se proporciona
  if (email && !isValidEmail(email)) {
    throw new ValidationError('El formato del email no es válido');
  }

  logger.info('Intento de registro', {
    email: email || 'desde-token',
    hasPassword: !!password,
    hasToken: !!idToken,
    tokenMask: idToken ? maskToken(idToken) : null,
    ip: req.ip || req.connection.remoteAddress
  });

  const result = await authService.register({
    email,
    password,
    name,
    idToken,
    role
  });

  logger.info('Registro exitoso', {
    uid: result.user.firebaseUid || result.user.id,
    email: result.user.email
  });

  res.status(201).json({
    success: true,
    message: result.message || 'Usuario registrado exitosamente',
    data: {
      user: result.user
    }
  });
};

/**
 * POST /api/v1/auth/verify
 * Verificar token de autenticación
 */
export const verify = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ValidationError('El campo idToken es requerido');
  }

  logger.debug('Verificación de token');

  const result = await authService.verifyToken(idToken);

  if (result.valid) {
    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        user: result.user
      }
    });
  } else {
    throw new AuthenticationError(result.error || 'Token inválido');
  }
};

/**
 * GET /api/v1/auth/me
 * Obtener perfil del usuario autenticado
 * Requiere autenticación (middleware authenticateToken)
 */
export const getMe = async (req, res) => {
  // req.user viene del middleware authenticateToken
  const { uid } = req.user;

  if (!uid) {
    throw new AuthenticationError('Usuario no autenticado');
  }

  logger.debug('Obteniendo perfil de usuario', { uid });

  const profile = await authService.getUserProfile(uid);

  res.status(200).json({
    success: true,
    data: {
      user: profile
    }
  });
};

/**
 * POST /api/v1/auth/refresh
 * Renovar token (opcional - por ahora solo retorna el mismo token)
 * En el futuro se puede implementar refresh tokens
 */
export const refresh = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ValidationError('El campo idToken es requerido');
  }

  logger.debug('Renovación de token');

  // Verificar que el token sea válido
  const result = await authService.verifyToken(idToken);

  if (!result.valid) {
    throw new AuthenticationError('Token inválido');
  }

  // Por ahora, retornar el mismo token
  // En el futuro se puede implementar refresh tokens reales
  res.status(200).json({
    success: true,
    message: 'Token verificado',
    data: {
      token: idToken,
      user: result.user
    }
  });
};

export default {
  login,
  register,
  verify,
  getMe,
  refresh
};

