/**
 * Sistema de Manejo de Errores Universal
 * Define errores personalizados y utilidades para manejo consistente
 */

import { logger } from './logger.js';

/**
 * Clase base para errores personalizados de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details })
      }
    };
  }
}

/**
 * Error de validación - 400
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Error de autenticación - 401
 */
export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado', details = null) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

/**
 * Error de token expirado - 401
 */
export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token expirado', details = null) {
    super(message, 401, 'TOKEN_EXPIRED', details);
  }
}

/**
 * Error de token inválido - 401
 */
export class InvalidTokenError extends AuthenticationError {
  constructor(message = 'Token inválido', details = null) {
    super(message, 401, 'INVALID_TOKEN', details);
  }
}

/**
 * Error de autorización - 403
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acceso prohibido', details = null) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

/**
 * Error de recurso no encontrado - 404
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/**
 * Error de conflicto - 409
 */
export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT_ERROR', details);
  }
}

/**
 * Error de base de datos
 */
export class DatabaseError extends AppError {
  constructor(message, details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * Error de servicio externo
 */
export class ExternalServiceError extends AppError {
  constructor(message, details = null) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

/**
 * Manejador de errores asíncronos
 * Envuelve funciones async para capturar errores automáticamente
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware de manejo de errores global
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;
  const isProduction = process.env.NODE_ENV === 'production';

  // Si no es un AppError, convertirlo
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';
    error = new AppError(message, statusCode, 'INTERNAL_ERROR', {
      originalError: error.name
    });
  }

  // Log del error (siempre incluir stack trace en logs del servidor)
  if (error.statusCode >= 500) {
    logger.error(`Error ${error.statusCode}: ${error.message}`, {
      code: error.code,
      details: error.details,
      stack: error.stack, // Stack trace solo en logs del servidor
      url: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection?.remoteAddress
    });
  } else {
    logger.warn(`Error ${error.statusCode}: ${error.message}`, {
      code: error.code,
      details: error.details,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection?.remoteAddress
    });
  }

  // Preparar respuesta para el cliente
  // En producción, NO exponer stack traces ni detalles sensibles
  const response = {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  };

  // Solo incluir detalles en desarrollo o si es un error de validación (400)
  if (!isProduction || error.statusCode === 400) {
    if (error.details) {
      response.error.details = error.details;
    }
  }

  // NUNCA exponer stack traces al cliente, incluso en desarrollo
  // Los stack traces solo van a los logs del servidor

  // Respuesta al cliente
  res.status(error.statusCode).json(response);
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta no encontrada: ${req.originalUrl}`);
  next(error);
};


