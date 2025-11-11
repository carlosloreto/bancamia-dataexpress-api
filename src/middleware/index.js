/**
 * Middlewares personalizados de la aplicación
 */

import { logger } from '../lib/logger.js';

/**
 * Middleware de logging de requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log cuando la respuesta se completa
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};

/**
 * Middleware de validación de JSON
 */
export const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('JSON inválido recibido', { error: err.message });
    return res.status(400).json({
      error: {
        message: 'JSON inválido en el cuerpo de la solicitud',
        code: 'INVALID_JSON'
      }
    });
  }
  next(err);
};

/**
 * Middleware de validación de Content-Type para POST/PUT
 */
export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn('Content-Type incorrecto', {
        method: req.method,
        contentType,
        path: req.path
      });
    }
  }
  next();
};

/**
 * Middleware para agregar headers de seguridad adicionales
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

// Exportar middlewares de autenticación
export {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership
} from './auth.middleware.js';

// Exportar middlewares de rate limiting
export {
  rateLimit,
  loginRateLimit,
  registerRateLimit
} from './rate-limit.middleware.js';


