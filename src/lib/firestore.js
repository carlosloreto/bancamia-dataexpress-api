/**
 * Módulo Centralizado de Firestore
 * Toda interacción con la base de datos debe realizarse a través de este módulo
 * Siguiendo las mejores prácticas de Firebase Admin SDK
 */

import admin from 'firebase-admin';
import { logger } from './logger.js';
import { DatabaseError } from './errors.js';

let db = null;
let isInitialized = false;

/**
 * Inicializa la conexión con Firestore
 */
export const initializeFirestore = () => {
  if (isInitialized) {
    logger.debug('Firestore ya está inicializado');
    return db;
  }

  try {
    // Verificar si ya existe una instancia inicializada
    if (admin.apps.length === 0) {
      // Inicializar con credenciales
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Opción 1: Usar archivo de credenciales
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        logger.info('Firebase inicializado con service account');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Opción 2: Usar ruta de archivo de credenciales
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        logger.info('Firebase inicializado con Application Default Credentials');
      } else if (process.env.NODE_ENV === 'development') {
        // Opción 3: Modo desarrollo - usar emulador
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
        });
        logger.warn('Firebase inicializado en modo desarrollo (emulador)');
      } else {
        throw new Error(
          'No se encontraron credenciales de Firebase. ' +
          'Define FIREBASE_SERVICE_ACCOUNT o GOOGLE_APPLICATION_CREDENTIALS'
        );
      }
    }

    // Obtener instancia de Firestore
    db = admin.firestore();

    // Configurar emulador si está en desarrollo y está definido
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      logger.info(`Usando Firestore Emulator en ${process.env.FIRESTORE_EMULATOR_HOST}`);
    }

    isInitialized = true;
    logger.info('Firestore inicializado exitosamente', {
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
    });

    return db;
  } catch (error) {
    logger.error('Error al inicializar Firestore', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('No se pudo conectar a Firestore', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene la instancia de Firestore
 * @returns {admin.firestore.Firestore} Instancia de Firestore
 */
export const getFirestore = () => {
  if (!isInitialized || !db) {
    return initializeFirestore();
  }
  return db;
};

/**
 * Obtiene una referencia a una colección
 * @param {string} collectionName - Nombre de la colección
 * @returns {admin.firestore.CollectionReference}
 */
export const collection = (collectionName) => {
  const firestore = getFirestore();
  return firestore.collection(collectionName);
};

/**
 * Obtiene una referencia a un documento
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 * @returns {admin.firestore.DocumentReference}
 */
export const doc = (collectionName, docId) => {
  const firestore = getFirestore();
  return firestore.collection(collectionName).doc(docId);
};

/**
 * Ejecuta una transacción en Firestore
 * @param {Function} updateFunction - Función que ejecuta la transacción
 * @returns {Promise<any>}
 */
export const runTransaction = async (updateFunction) => {
  const firestore = getFirestore();
  try {
    return await firestore.runTransaction(updateFunction);
  } catch (error) {
    logger.error('Error en transacción de Firestore', {
      error: error.message
    });
    throw new DatabaseError('Error al ejecutar transacción', {
      originalError: error.message
    });
  }
};

/**
 * Ejecuta un batch de operaciones
 * @returns {admin.firestore.WriteBatch}
 */
export const batch = () => {
  const firestore = getFirestore();
  return firestore.batch();
};

/**
 * Obtiene el Timestamp de Firestore
 */
export const Timestamp = admin.firestore.Timestamp;

/**
 * Obtiene FieldValue para operaciones especiales
 */
export const FieldValue = admin.firestore.FieldValue;

/**
 * Convierte un documento de Firestore a objeto JavaScript
 * @param {admin.firestore.DocumentSnapshot} doc - Documento de Firestore
 * @returns {Object|null} Objeto con los datos del documento o null
 */
export const docToObject = (doc) => {
  if (!doc.exists) {
    return null;
  }
  return {
    id: doc.id,
    ...doc.data()
  };
};

/**
 * Convierte una colección de documentos a array de objetos
 * @param {admin.firestore.QuerySnapshot} snapshot - Snapshot de la consulta
 * @returns {Array<Object>} Array de objetos
 */
export const snapshotToArray = (snapshot) => {
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => docToObject(doc));
};

/**
 * Cierra la conexión con Firestore (útil para tests)
 */
export const closeFirestore = async () => {
  if (isInitialized) {
    await admin.app().delete();
    db = null;
    isInitialized = false;
    logger.info('Conexión con Firestore cerrada');
  }
};

// Exportar el objeto admin completo para casos especiales
export { admin };

// Exportar la instancia de db como default
export default {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  runTransaction,
  batch,
  Timestamp,
  FieldValue,
  docToObject,
  snapshotToArray,
  closeFirestore,
  admin
};


