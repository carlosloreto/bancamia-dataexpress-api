/**
 * Punto de entrada de la aplicación
 */

import app from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';

const PORT = config.port;

/**
 * Iniciar servidor
 * IMPORTANTE para Cloud Run:
 * - Debe escuchar en 0.0.0.0 (no localhost)
 * - El puerto viene de la variable de entorno PORT (Cloud Run la establece automáticamente)
 * - Debe responder rápidamente a health checks
 */
const HOST = '0.0.0.0'; // Cloud Run requiere 0.0.0.0 explícitamente

// Verificar que el puerto esté configurado
if (!PORT) {
  logger.error('PORT no está definido. Cloud Run requiere que PORT esté configurado.');
  process.exit(1);
}

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Servidor iniciado exitosamente`, {
    host: HOST,
    port: PORT,
    environment: config.nodeEnv,
    apiVersion: config.api.version,
    cloudRun: process.env.K_SERVICE ? 'Sí' : 'No',
    url: `http://${HOST}:${PORT}`,
    healthCheck: `http://${HOST}:${PORT}/health`,
    apiBase: `http://${HOST}:${PORT}${config.api.prefix}/${config.api.version}`
  });
  
  // Log adicional para verificar que las rutas están registradas
  logger.info('Rutas registradas:', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    endpoints: [
      '/health',
      '/test-post',
      '/',
      `${config.api.prefix}/${config.api.version}/solicitudes`,
      `${config.api.prefix}/${config.api.version}/users`
    ]
  });
  
  // Verificar que el servidor está escuchando correctamente
  logger.info('Servidor listo para recibir requests', {
    listening: server.listening,
    address: server.address()
  });
});

/**
 * Manejo de errores no capturados
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada', {
    reason: reason,
    promise: promise
  });
  // En producción, podrías querer cerrar el servidor
  if (config.isProduction) {
    server.close(() => {
      process.exit(1);
    });
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada', {
    error: error.message,
    stack: error.stack
  });
  // Cerrar el servidor y salir
  server.close(() => {
    process.exit(1);
  });
});

/**
 * Manejo de señales de terminación
 */
const gracefulShutdown = (signal) => {
  logger.info(`Señal ${signal} recibida, cerrando servidor...`);
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('Cierre forzado después de timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;


