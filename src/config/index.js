/**
 * Configuración centralizada de la aplicación
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Configuración del servidor
  // Cloud Run establece PORT automáticamente, usar 3000 solo para desarrollo local
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de la API
  api: {
    version: process.env.API_VERSION || 'v2',
    prefix: process.env.API_PREFIX || '/api'
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // Configuración de Firebase/Firestore
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST
  },

  // Verificar si está en producción
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
};

export default config;

