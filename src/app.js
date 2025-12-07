/**
 * Configuración de la aplicación Express
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './lib/errors.js';
// Usar Client SDK (temporal) en lugar de Admin SDK
import { initializeFirestore } from './lib/firestore-client.js';
import { initializeAuth } from './lib/firebase-auth.js';
import { initializeStorage } from './lib/storage.js';
import {
  requestLogger,
  validateJSON,
  validateContentType,
  securityHeaders
} from './middleware/index.js';

// Importar rutas
import apiRoutes from './routes/index.js';

// Inicializar Firestore
try {
  initializeFirestore();
} catch (error) {
  logger.error('Error fatal al inicializar Firestore', {
    error: error.message
  });
  // En producción, podrías querer salir del proceso
  if (config.isProduction) {
    process.exit(1);
  }
}

// Inicializar Firebase Auth
try {
  initializeAuth();
} catch (error) {
  logger.error('Error fatal al inicializar Firebase Auth', {
    error: error.message
  });
  // En producción, podrías querer salir del proceso
  if (config.isProduction) {
    process.exit(1);
  }
}

// Inicializar Firebase Storage
try {
  initializeStorage();
} catch (error) {
  logger.error('Error fatal al inicializar Firebase Storage', {
    error: error.message
  });
  // En producción, podrías querer salir del proceso
  if (config.isProduction) {
    process.exit(1);
  }
}

// Crear aplicación Express
const app = express();

// =====================================
// Middlewares de seguridad
// =====================================
// Configurar Helmet con opciones menos restrictivas para Cloud Run
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitar CSP para APIs
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir cross-origin
}));
app.use(securityHeaders); // Headers adicionales
// Configurar CORS para permitir todas las conexiones (scripts, navegadores, etc.)
app.use(cors({
  origin: '*', // Permitir todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 horas
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Manejar preflight OPTIONS explícitamente (importante para Cloud Run)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.sendStatus(204);
});

// =====================================
// Middlewares de parsing (ANTES de otros middlewares)
// =====================================
// IMPORTANTE: express.json debe ir ANTES de otros middlewares que usen req.body
// Configuración flexible para Cloud Run (puede agregar headers adicionales)
app.use(express.json({ 
  limit: '10mb',
  strict: false, // Permitir JSON flexible (Cloud Run puede modificar Content-Type)
  type: ['application/json', 'application/json; charset=utf-8', 'text/json'] // Múltiples tipos aceptados
})); // Parse JSON
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  type: ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded; charset=utf-8'] // Múltiples tipos aceptados
})); // Parse URL-encoded
app.use(compression()); // Comprimir respuestas

// =====================================
// Middlewares personalizados
// =====================================
app.use(requestLogger); // Log de requests
app.use(validateContentType); // Validar Content-Type

// Timeout handler para Cloud Run (evitar que las requests se cuelguen)
// Debe ir ANTES de las rutas para aplicar a todas las requests
app.use((req, res, next) => {
  // Establecer timeout de 50 segundos (menos que el de Cloud Run de 60s)
  req.setTimeout(50000, () => {
    logger.error('Request timeout', { 
      method: req.method, 
      path: req.path,
      timeout: 50000 
    });
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: {
          message: 'Request timeout - El servidor tardó demasiado en responder',
          code: 'TIMEOUT'
        }
      });
    }
  });
  next();
});

// =====================================
// Health check
// =====================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// Endpoint de prueba para verificar que POST funciona
app.post('/test-post', (req, res) => {
  logger.info('POST /test-post recibido', {
    body: req.body,
    headers: req.headers
  });
  res.status(200).json({
    success: true,
    message: 'POST funciona correctamente',
    received: req.body
  });
});

// =====================================
// Ruta raíz
// =====================================
app.get('/', (req, res) => {
  res.json({
    name: 'Bancamia DataExpress API',
    version: config.api.version,
    status: 'running',
    documentation: `${config.api.prefix}/${config.api.version}/docs`
  });
});

// =====================================
// Rutas de la API
// =====================================
app.use(`${config.api.prefix}/${config.api.version}`, apiRoutes);

// =====================================
// Manejo de errores
// =====================================
// IMPORTANTE: validateJSON debe ir DESPUÉS de express.json para capturar errores de parsing
app.use(validateJSON); // Errores de JSON inválido
app.use(notFoundHandler); // Rutas no encontradas (404)
app.use(errorHandler); // Manejo global de errores

// Log de inicio de la aplicación
logger.info('Aplicación Express inicializada', {
  environment: config.nodeEnv,
  apiVersion: config.api.version
});

export default app;

