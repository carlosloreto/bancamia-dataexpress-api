/**
 * Middleware de rate limiting básico
 * Limita el número de requests por IP para endpoints de autenticación
 */

import { logger } from '../lib/logger.js';
import { ValidationError } from '../lib/errors.js';

// Almacenamiento en memoria (en producción usar Redis)
const requestCounts = new Map();

/**
 * Limpia contadores antiguos cada 5 minutos
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.expiresAt) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Middleware de rate limiting
 * @param {Object} options - Opciones de rate limiting
 * @param {number} options.windowMs - Ventana de tiempo en milisegundos
 * @param {number} options.maxRequests - Número máximo de requests
 * @param {string} options.message - Mensaje de error personalizado
 */
export const rateLimit = ({ windowMs = 60000, maxRequests = 5, message = 'Demasiadas solicitudes' }) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}-${req.path}`;
    const now = Date.now();

    const record = requestCounts.get(key);

    if (!record || now > record.expiresAt) {
      // Primera request o ventana expirada
      requestCounts.set(key, {
        count: 1,
        expiresAt: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      logger.warn('Rate limit excedido', {
        ip,
        path: req.path,
        count: record.count,
        maxRequests
      });
      return res.status(429).json({
        success: false,
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((record.expiresAt - now) / 1000)
        }
      });
    }

    // Incrementar contador
    record.count++;
    requestCounts.set(key, record);
    next();
  };
};

/**
 * Rate limiter específico para login (5 intentos por minuto)
 */
export const loginRateLimit = rateLimit({
  windowMs: 60000, // 1 minuto
  maxRequests: 5,
  message: 'Demasiados intentos de login. Intenta nuevamente en un minuto.'
});

/**
 * Rate limiter específico para registro (3 intentos por hora)
 */
export const registerRateLimit = rateLimit({
  windowMs: 3600000, // 1 hora
  maxRequests: 3,
  message: 'Demasiados intentos de registro. Intenta nuevamente en una hora.'
});

export default {
  rateLimit,
  loginRateLimit,
  registerRateLimit
};

