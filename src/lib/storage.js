/**
 * Módulo de Firebase Storage
 * Maneja la subida y gestión de archivos en Firebase Storage
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { logger } from './logger.js';

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

let storage = null;
let isInitialized = false;

/**
 * Inicializa Firebase Storage
 */
export const initializeStorage = () => {
  if (isInitialized && storage) {
    return storage;
  }

  try {
    // Obtener la app existente o crear una nueva
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Obtener instancia de Storage
    storage = getStorage(app);
    isInitialized = true;
    
    logger.info('Firebase Storage inicializado exitosamente', {
      bucket: firebaseConfig.storageBucket
    });

    return storage;
  } catch (error) {
    logger.error('Error al inicializar Firebase Storage', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Obtiene la instancia de Storage
 */
export const getStorageInstance = () => {
  if (!isInitialized || !storage) {
    return initializeStorage();
  }
  return storage;
};

/**
 * Sube un archivo PDF a Firebase Storage
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} fileName - Nombre original del archivo
 * @param {string} solicitudId - ID de la solicitud (para organizar archivos)
 * @returns {Promise<{url: string, path: string}>} URL de descarga y path del archivo
 */
export const uploadPDF = async (fileBuffer, fileName, solicitudId) => {
  try {
    const storageInstance = getStorageInstance();
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `solicitudes/${solicitudId}/${timestamp}_${sanitizedFileName}`;
    
    // Crear referencia al archivo
    const fileRef = ref(storageInstance, storagePath);
    
    // Subir el archivo
    const metadata = {
      contentType: 'application/pdf',
      customMetadata: {
        solicitudId: solicitudId,
        originalName: fileName,
        uploadedAt: new Date().toISOString()
      }
    };
    
    await uploadBytes(fileRef, fileBuffer, metadata);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(fileRef);
    
    logger.info('PDF subido exitosamente a Firebase Storage', {
      path: storagePath,
      solicitudId,
      fileName
    });
    
    return {
      url: downloadURL,
      path: storagePath,
      fileName: sanitizedFileName,
      originalName: fileName
    };
  } catch (error) {
    logger.error('Error al subir PDF a Firebase Storage', {
      error: error.message,
      solicitudId,
      fileName
    });
    throw error;
  }
};

/**
 * Elimina un archivo de Firebase Storage
 * @param {string} filePath - Path del archivo en Storage
 */
export const deleteFile = async (filePath) => {
  try {
    const storageInstance = getStorageInstance();
    const fileRef = ref(storageInstance, filePath);
    
    await deleteObject(fileRef);
    
    logger.info('Archivo eliminado de Firebase Storage', { path: filePath });
    
    return true;
  } catch (error) {
    // Si el archivo no existe, no es un error crítico
    if (error.code === 'storage/object-not-found') {
      logger.warn('Archivo no encontrado en Storage', { path: filePath });
      return false;
    }
    
    logger.error('Error al eliminar archivo de Firebase Storage', {
      error: error.message,
      path: filePath
    });
    throw error;
  }
};

export default {
  initializeStorage,
  getStorageInstance,
  uploadPDF,
  deleteFile
};

