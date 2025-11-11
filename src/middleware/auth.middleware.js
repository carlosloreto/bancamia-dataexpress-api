/**
 * Middleware de autenticación
 * Verifica tokens de Firebase Auth y protege rutas
 */

import { verifyIdToken } from '../lib/firebase-auth.js';
import { AuthenticationError, TokenExpiredError, InvalidTokenError, AuthorizationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/**
 * Middleware para verificar token de autenticación
 * Extrae el token del header Authorization y verifica con Firebase
 * Agrega req.user con información del usuario autenticado
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('Token de autenticación requerido');
    }

    // Verificar formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Formato de token inválido. Use: Bearer <token>');
    }

    const idToken = parts[1];

    if (!idToken) {
      throw new AuthenticationError('Token no proporcionado');
    }

    // Verificar token con Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      // Mapear errores de Firebase a errores personalizados
      if (error.code === 'auth/id-token-expired') {
        throw new TokenExpiredError('El token ha expirado');
      }
      if (error.code === 'auth/id-token-revoked' || error.code === 'auth/argument-error') {
        throw new InvalidTokenError('Token inválido o revocado');
      }
      throw new InvalidTokenError(`Token inválido: ${error.message}`);
    }

    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || decodedToken.display_name || null,
      picture: decodedToken.picture || null,
      customClaims: decodedToken.custom_claims || {},
      // Incluir otros campos útiles del token
      authTime: decodedToken.auth_time,
      exp: decodedToken.exp,
      iat: decodedToken.iat
    };

    logger.debug('Usuario autenticado', {
      uid: req.user.uid,
      email: req.user.email,
      path: req.path
    });

    next();
  } catch (error) {
    // Si es un error de autenticación, pasarlo al siguiente middleware
    if (error instanceof AuthenticationError || 
        error instanceof TokenExpiredError || 
        error instanceof InvalidTokenError) {
      return next(error);
    }
    
    // Otros errores
    logger.error('Error en middleware de autenticación', {
      error: error.message,
      path: req.path
    });
    next(new AuthenticationError('Error al verificar autenticación'));
  }
};

/**
 * Middleware opcional de autenticación
 * Verifica el token si existe, pero no requiere autenticación
 * Útil para rutas que funcionan con o sin autenticación
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No hay token, continuar sin autenticación
      req.user = null;
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Formato inválido, continuar sin autenticación
      req.user = null;
      return next();
    }

    const idToken = parts[1];

    if (!idToken) {
      req.user = null;
      return next();
    }

    // Intentar verificar token
    try {
      const decodedToken = await verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        name: decodedToken.name || decodedToken.display_name || null,
        picture: decodedToken.picture || null,
        customClaims: decodedToken.custom_claims || {}
      };
    } catch (error) {
      // Si falla la verificación, continuar sin autenticación
      req.user = null;
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    req.user = null;
    next();
  }
};

/**
 * Factory function para crear middleware que requiere un rol específico
 * @param {string|string[]} requiredRoles - Rol(es) requerido(s)
 * @returns {Function} Middleware de Express
 */
export const requireRole = (requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    // Primero verificar que el usuario esté autenticado
    if (!req.user) {
      return next(new AuthenticationError('Autenticación requerida'));
    }

    // Obtener rol del usuario (de custom claims o de req.user)
    const userRole = req.user.customClaims?.role || req.user.role || 'user';

    // Verificar si el usuario tiene uno de los roles requeridos
    if (!roles.includes(userRole)) {
      logger.warn('Acceso denegado por falta de permisos', {
        uid: req.user.uid,
        userRole,
        requiredRoles: roles,
        path: req.path
      });
      return next(new AuthorizationError(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      ));
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario es el propietario del recurso
 * Compara req.user.uid con el parámetro :userId o :id de la ruta
 */
export const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Autenticación requerida'));
    }

    const resourceUserId = req.params[paramName] || req.params.id;
    
    if (!resourceUserId) {
      return next(new AuthorizationError('ID de recurso no especificado'));
    }

    // Permitir si es el propietario o si es admin
    const isOwner = req.user.uid === resourceUserId;
    const isAdmin = req.user.customClaims?.role === 'admin' || req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      logger.warn('Acceso denegado: no es propietario del recurso', {
        uid: req.user.uid,
        resourceUserId,
        path: req.path
      });
      return next(new AuthorizationError('No tienes permiso para acceder a este recurso'));
    }

    next();
  };
};

export default {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership
};

