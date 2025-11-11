/**
 * Módulo de Firebase Authentication
 * Usa Firebase Admin SDK para verificar tokens y gestionar usuarios
 */

import admin from 'firebase-admin';
import { logger } from './logger.js';
import { DatabaseError, TokenExpiredError, InvalidTokenError, NotFoundError } from './errors.js';

let auth = null;
let isInitialized = false;

/**
 * Inicializa Firebase Auth usando Firebase Admin SDK
 * 
 * MÉTODO MÁS SEGURO: Application Default Credentials (ADC)
 * 
 * ⚠️ IMPORTANTE: NO se puede usar Client SDK en el backend para Auth porque:
 * - El Client SDK NO puede verificar tokens de forma segura
 * - No tiene privilegios de administrador
 * - Cualquiera podría falsificar tokens
 * 
 * Prioridad de métodos (de más seguro a menos seguro):
 * 1. Application Default Credentials (Cloud Run automático) - RECOMENDADO
 * 2. GOOGLE_APPLICATION_CREDENTIALS (archivo en servidor)
 * 3. FIREBASE_SERVICE_ACCOUNT (JSON en variable de entorno) - Solo para desarrollo
 */
export const initializeAuth = () => {
  if (isInitialized) {
    logger.debug('Firebase Auth ya está inicializado');
    return auth;
  }

  try {
    // Verificar si Admin SDK ya está inicializado
    if (admin.apps.length === 0) {
      logger.info('Inicializando Firebase Admin SDK...', {
        projectId: process.env.FIREBASE_PROJECT_ID,
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID
      });
      
      // MÉTODO 1: Application Default Credentials (MÁS SEGURO)
      // Cloud Run automáticamente proporciona credenciales mediante la cuenta de servicio
      // asociada al servicio. No necesitas claves de cuenta de servicio.
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        logger.info('✅ Firebase Admin SDK inicializado con Application Default Credentials (método más seguro)', {
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      } catch (adcError) {
        // Si ADC falla, intentar otros métodos (solo para desarrollo local)
        logger.warn('ADC no disponible, intentando métodos alternativos', {
          error: adcError.message
        });

        // MÉTODO 2: GOOGLE_APPLICATION_CREDENTIALS (archivo de credenciales)
        // Más seguro que variable de entorno, pero requiere acceso al archivo
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID
          });
          logger.info('Firebase Admin SDK inicializado con GOOGLE_APPLICATION_CREDENTIALS');
        }
        // MÉTODO 3: FIREBASE_SERVICE_ACCOUNT (solo para desarrollo local)
        // ⚠️ MENOS SEGURO - Solo usar en desarrollo, nunca en producción
        else if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.NODE_ENV !== 'production') {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID
          });
          logger.warn('Firebase Admin SDK inicializado con FIREBASE_SERVICE_ACCOUNT (solo desarrollo)');
        } else {
          throw new Error(
            'No se encontraron credenciales de Firebase. ' +
            'En Cloud Run, asegúrate de que el servicio tenga una cuenta de servicio asociada. ' +
            'En desarrollo local, define GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT'
          );
        }
      }
    }

    // Obtener instancia de Auth
    auth = admin.auth();
    isInitialized = true;

    logger.info('✅ Firebase Auth inicializado exitosamente', {
      method: admin.apps.length > 0 ? 'ADC (Application Default Credentials)' : 'desconocido',
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    return auth;
  } catch (error) {
    logger.error('Error al inicializar Firebase Auth', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('No se pudo inicializar Firebase Auth', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene la instancia de Firebase Auth
 */
export const getAuth = () => {
  if (!isInitialized || !auth) {
    return initializeAuth();
  }
  return auth;
};

/**
 * Verifica un ID token de Firebase
 * @param {string} idToken - Token ID de Firebase Auth
 * @returns {Promise<admin.auth.DecodedIdToken>} Token decodificado con información del usuario
 */
export const verifyIdToken = async (idToken) => {
  try {
    const authInstance = getAuth();
    const decodedToken = await authInstance.verifyIdToken(idToken);
    
    logger.debug('Token verificado exitosamente', {
      uid: decodedToken.uid,
      email: decodedToken.email
    });

    return decodedToken;
  } catch (error) {
    // Mapear errores de Firebase a errores personalizados
    if (error.code === 'auth/id-token-expired') {
      throw new TokenExpiredError('El token ha expirado');
    }
    if (error.code === 'auth/id-token-revoked') {
      throw new InvalidTokenError('El token ha sido revocado');
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      throw new InvalidTokenError('Token inválido');
    }
    
    logger.warn('Error al verificar token', {
      error: error.code || error.message
    });
    throw new InvalidTokenError(`Error al verificar token: ${error.message}`);
  }
};

/**
 * Obtiene información de un usuario por UID
 * @param {string} uid - UID del usuario en Firebase Auth
 * @returns {Promise<admin.auth.UserRecord>} Información del usuario
 */
export const getUser = async (uid) => {
  try {
    const authInstance = getAuth();
    const userRecord = await authInstance.getUser(uid);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new NotFoundError(`Usuario con UID ${uid} no encontrado`);
    }
    logger.error('Error al obtener usuario', {
      uid,
      error: error.message
    });
    throw new DatabaseError('Error al obtener usuario', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene información de un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<admin.auth.UserRecord>} Información del usuario
 */
export const getUserByEmail = async (email) => {
  try {
    const authInstance = getAuth();
    const userRecord = await authInstance.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    logger.error('Error al obtener usuario por email', {
      email,
      error: error.message
    });
    throw error;
  }
};

/**
 * Crea un nuevo usuario en Firebase Auth
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña (opcional)
 * @param {string} userData.displayName - Nombre a mostrar (opcional)
 * @param {string} userData.photoURL - URL de foto (opcional)
 * @param {boolean} userData.emailVerified - Si el email está verificado (opcional)
 * @returns {Promise<admin.auth.UserRecord>} Usuario creado
 */
export const createUser = async (userData) => {
  try {
    const authInstance = getAuth();
    const createUserData = {
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName || userData.name,
      photoURL: userData.photoURL,
      emailVerified: userData.emailVerified || false
    };

    const userRecord = await authInstance.createUser(createUserData);

    logger.info('Usuario creado en Firebase Auth', {
      uid: userRecord.uid,
      email: userRecord.email
    });

    return userRecord;
  } catch (error) {
    logger.error('Error al crear usuario en Firebase Auth', {
      email: userData.email,
      error: error.message
    });
    throw error;
  }
};

/**
 * Actualiza un usuario en Firebase Auth
 * @param {string} uid - UID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<admin.auth.UserRecord>} Usuario actualizado
 */
export const updateUser = async (uid, updateData) => {
  try {
    const authInstance = getAuth();
    const userRecord = await authInstance.updateUser(uid, updateData);

    logger.info('Usuario actualizado en Firebase Auth', {
      uid,
      fields: Object.keys(updateData)
    });

    return userRecord;
  } catch (error) {
    logger.error('Error al actualizar usuario en Firebase Auth', {
      uid,
      error: error.message
    });
    throw error;
  }
};

/**
 * Elimina un usuario de Firebase Auth
 * @param {string} uid - UID del usuario
 * @returns {Promise<void>}
 */
export const deleteUser = async (uid) => {
  try {
    const authInstance = getAuth();
    await authInstance.deleteUser(uid);

    logger.info('Usuario eliminado de Firebase Auth', { uid });
  } catch (error) {
    logger.error('Error al eliminar usuario de Firebase Auth', {
      uid,
      error: error.message
    });
    throw error;
  }
};

/**
 * Establece claims personalizados para un usuario (roles, permisos, etc.)
 * @param {string} uid - UID del usuario
 * @param {Object} customClaims - Claims personalizados (ej: { role: 'admin' })
 * @returns {Promise<void>}
 */
export const setCustomUserClaims = async (uid, customClaims) => {
  try {
    const authInstance = getAuth();
    await authInstance.setCustomUserClaims(uid, customClaims);

    logger.info('Custom claims establecidos', {
      uid,
      claims: customClaims
    });
  } catch (error) {
    logger.error('Error al establecer custom claims', {
      uid,
      error: error.message
    });
    throw error;
  }
};

/**
 * Revoca todos los refresh tokens de un usuario
 * @param {string} uid - UID del usuario
 * @returns {Promise<void>}
 */
export const revokeRefreshTokens = async (uid) => {
  try {
    const authInstance = getAuth();
    await authInstance.revokeRefreshTokens(uid);

    logger.info('Refresh tokens revocados', { uid });
  } catch (error) {
    logger.error('Error al revocar refresh tokens', {
      uid,
      error: error.message
    });
    throw error;
  }
};

export default {
  initializeAuth,
  getAuth,
  verifyIdToken,
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  setCustomUserClaims,
  revokeRefreshTokens
};

