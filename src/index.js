/**
 * Punto de entrada de la aplicación
 */

import app from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';

const PORT = config.port;

/**
 * Iniciar servidor
 */
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado exitosamente`, {
    port: PORT,
    environment: config.nodeEnv,
    apiVersion: config.api.version,
    url: `http://localhost:${PORT}`,
    healthCheck: `http://localhost:${PORT}/health`,
    apiBase: `http://localhost:${PORT}${config.api.prefix}/${config.api.version}`
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


