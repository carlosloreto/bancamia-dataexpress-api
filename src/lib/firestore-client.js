/**
 * Módulo de Firestore usando Client SDK (TEMPORAL)
 * Usa las credenciales del cliente para conectarse a Firestore
 * 
 * NOTA: Esta es una solución temporal hasta obtener el Service Account.
 * Limitaciones:
 * - Sujeto a Security Rules de Firestore
 * - No tiene privilegios de administrador
 * - Menos funcionalidades que Admin SDK
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection as firestoreCollection,
  doc as firestoreDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore';
import { logger } from './logger.js';
import { DatabaseError } from './errors.js';

// Configuración de Firebase (desde variables de entorno)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

let db = null;
let isInitialized = false;

/**
 * Inicializa la conexión con Firestore usando Client SDK
 */
export const initializeFirestore = () => {
  if (isInitialized) {
    logger.debug('Firestore ya está inicializado');
    return db;
  }

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    
    // Obtener instancia de Firestore
    db = getFirestore(app);
    
    isInitialized = true;
    
    logger.info('Firestore inicializado exitosamente (Client SDK)', {
      projectId: firebaseConfig.projectId,
      note: 'Usando credenciales de cliente - Solución temporal'
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
 */
export const getFirestoreDB = () => {
  if (!isInitialized || !db) {
    return initializeFirestore();
  }
  return db;
};

/**
 * Obtiene una referencia a una colección
 */
export const collection = (collectionName) => {
  const firestore = getFirestoreDB();
  return firestoreCollection(firestore, collectionName);
};

/**
 * Obtiene una referencia a un documento
 */
export const doc = (collectionName, docId) => {
  const firestore = getFirestoreDB();
  return firestoreDoc(firestore, collectionName, docId);
};

/**
 * Convierte un documento de Firestore a objeto JavaScript
 */
export const docToObject = (docSnapshot) => {
  if (!docSnapshot.exists()) {
    return null;
  }
  return {
    id: docSnapshot.id,
    ...docSnapshot.data()
  };
};

/**
 * Convierte una colección de documentos a array de objetos
 */
export const snapshotToArray = (querySnapshot) => {
  if (querySnapshot.empty) {
    return [];
  }
  return querySnapshot.docs.map(doc => docToObject(doc));
};

/**
 * FieldValue para serverTimestamp
 */
export const FieldValue = {
  serverTimestamp: () => serverTimestamp()
};

/**
 * Timestamp (en Client SDK los timestamps vienen como objetos Timestamp)
 */
export const Timestamp = {
  now: () => new Date(),
  fromDate: (date) => date
};

// Exportar funciones de Firestore
export {
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  firestoreLimit as limit
};

export default {
  initializeFirestore,
  getFirestoreDB,
  collection,
  doc,
  docToObject,
  snapshotToArray,
  FieldValue,
  Timestamp
};

