/**
 * Middleware de rate limiting básico
 * Limita el número de requests por IP para endpoints de autenticación
 * 
 * NOTA: Este rate limiting usa almacenamiento en memoria y no funciona perfectamente
 * en arquitecturas distribuidas (múltiples instancias de Cloud Run).
 * Cada instancia tiene su propio contador.
 * 
 * TODO: Migrar a Redis o Cloud Memorystore para rate limiting distribuido
 */

import { logger } from '../lib/logger.js';
import { ValidationError } from '../lib/errors.js';

// Almacenamiento en memoria (en producción usar Redis)
const requestCounts = new Map();

/**
 * Limpia contadores antiguos cada 5 minutos
 * Optimizado para mejor rendimiento
 */
setInterval(() => {
  const now = Date.now();
  const keysToDelete = [];
  
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.expiresAt) {
      keysToDelete.push(key);
    }
  }
  
  // Eliminar en batch para mejor rendimiento
  keysToDelete.forEach(key => requestCounts.delete(key));
  
  if (keysToDelete.length > 0) {
    logger.debug(`Rate limiting: limpiados ${keysToDelete.length} contadores expirados`);
  }
}, 5 * 60 * 1000);

/**
 * Obtiene la IP real del cliente considerando proxies y Cloud Run
 */
const getClientIp = (req) => {
  // Cloud Run y proxies agregan X-Forwarded-For
  // Formato: "client-ip, proxy1-ip, proxy2-ip"
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Tomar la primera IP (cliente real)
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || req.ip || req.connection?.remoteAddress || 'unknown';
  }
  
  // Fallback a IPs estándar
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
};

/**
 * Middleware de rate limiting
 * @param {Object} options - Opciones de rate limiting
 * @param {number} options.windowMs - Ventana de tiempo en milisegundos
 * @param {number} options.maxRequests - Número máximo de requests
 * @param {string} options.message - Mensaje de error personalizado
 */
export const rateLimit = ({ windowMs = 60000, maxRequests = 5, message = 'Demasiadas solicitudes' }) => {
  return (req, res, next) => {
    const ip = getClientIp(req);
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
 * Rate limiter específico para registro (20 intentos por hora)
 */
export const registerRateLimit = rateLimit({
  windowMs: 3600000, // 1 hora
  maxRequests: 20,
  message: 'Demasiados intentos de registro. Intenta nuevamente en una hora.'
});

export default {
  rateLimit,
  loginRateLimit,
  registerRateLimit
};

