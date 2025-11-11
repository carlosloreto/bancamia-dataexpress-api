/**
 * Servicio de autenticación
 * Maneja la lógica de negocio para autenticación con Firebase Auth
 * Sincroniza usuarios entre Firebase Auth y Firestore
 */

import {
  verifyIdToken,
  getUser as getAuthUser,
  getUserByEmail as getAuthUserByEmail,
  createUser as createAuthUser
} from '../lib/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  docToObject,
  FieldValue
} from '../lib/firestore-client.js';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  DatabaseError,
  NotFoundError
} from '../lib/errors.js';
import { logger } from '../lib/logger.js';

const USERS_COLLECTION = 'users';

/**
 * Sincroniza un usuario de Firebase Auth con Firestore
 * Si el usuario no existe en Firestore, lo crea
 * Si existe, actualiza la última sesión
 */
export const syncUserToFirestore = async (uid, authUserData = null) => {
  try {
    // Obtener información del usuario de Firebase Auth si no se proporciona
    let authUser = authUserData;
    if (!authUser) {
      authUser = await getAuthUser(uid);
    }

    // Buscar usuario en Firestore por firebaseUid
    const usersCollection = collection(USERS_COLLECTION);
    const q = query(usersCollection, where('firebaseUid', '==', uid));
    const snapshot = await getDocs(q);

    const now = new Date();

    if (snapshot.empty) {
      // Usuario no existe en Firestore, crearlo
      const newUserData = {
        firebaseUid: uid,
        email: authUser.email || '',
        name: authUser.displayName || authUser.name || '',
        emailVerified: authUser.emailVerified || false,
        photoURL: authUser.photoURL || null,
        role: authUser.customClaims?.role || 'user',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp()
      };

      const docRef = await addDoc(usersCollection, newUserData);
      const createdDoc = await getDoc(docRef);
      const createdUser = docToObject(createdDoc);

      logger.info('Usuario sincronizado con Firestore (creado)', {
        uid,
        firestoreId: docRef.id,
        email: authUser.email
      });

      return {
        ...createdUser,
        createdAt: createdUser.createdAt?.toDate?.().toISOString() || now.toISOString(),
        updatedAt: createdUser.updatedAt?.toDate?.().toISOString() || now.toISOString(),
        lastLoginAt: createdUser.lastLoginAt?.toDate?.().toISOString() || now.toISOString()
      };
    } else {
      // Usuario existe, actualizar última sesión
      const existingUser = docToObject(snapshot.docs[0]);
      const userDocRef = doc(USERS_COLLECTION, existingUser.id);

      const updateData = {
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
        // Actualizar datos que puedan haber cambiado en Auth
        email: authUser.email || existingUser.email,
        name: authUser.displayName || authUser.name || existingUser.name,
        emailVerified: authUser.emailVerified !== undefined ? authUser.emailVerified : existingUser.emailVerified,
        photoURL: authUser.photoURL || existingUser.photoURL || null
      };

      await updateDoc(userDocRef, updateData);
      const updatedDoc = await getDoc(userDocRef);
      const updatedUser = docToObject(updatedDoc);

      logger.debug('Usuario sincronizado con Firestore (actualizado)', {
        uid,
        firestoreId: existingUser.id,
        email: authUser.email
      });

      return {
        ...updatedUser,
        createdAt: updatedUser.createdAt?.toDate?.().toISOString() || null,
        updatedAt: updatedUser.updatedAt?.toDate?.().toISOString() || now.toISOString(),
        lastLoginAt: updatedUser.lastLoginAt?.toDate?.().toISOString() || now.toISOString()
      };
    }
  } catch (error) {
    logger.error('Error al sincronizar usuario con Firestore', {
      uid,
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('Error al sincronizar usuario', {
      originalError: error.message
    });
  }
};

/**
 * Procesa el login de un usuario
 * Verifica el token y sincroniza con Firestore
 */
export const login = async (idToken) => {
  try {
    if (!idToken) {
      throw new ValidationError('Token de autenticación requerido');
    }

    // Verificar token con Firebase Auth
    const decodedToken = await verifyIdToken(idToken);

    // Obtener información completa del usuario de Firebase Auth
    const authUser = await getAuthUser(decodedToken.uid);

    // Sincronizar con Firestore
    const firestoreUser = await syncUserToFirestore(decodedToken.uid, authUser);

    logger.info('Login exitoso', {
      uid: decodedToken.uid,
      email: authUser.email
    });

    return {
      user: {
        ...firestoreUser,
        // Incluir información adicional de Auth
        customClaims: authUser.customClaims || {}
      },
      token: idToken // Retornar el mismo token (el frontend ya lo tiene)
    };
  } catch (error) {
    // Si es un error de autenticación, dejarlo pasar
    if (error instanceof AuthenticationError || 
        error instanceof ValidationError) {
      throw error;
    }

    logger.error('Error en login', {
      error: error.message,
      stack: error.stack
    });
    throw new AuthenticationError('Error al procesar login', {
      originalError: error.message
    });
  }
};

/**
 * Registra un nuevo usuario
 * Crea usuario en Firebase Auth y sincroniza con Firestore
 */
export const register = async (userData) => {
  try {
    // Validar datos requeridos
    if (!userData.email) {
      throw new ValidationError('El email es requerido');
    }

    if (!userData.password && !userData.idToken) {
      throw new ValidationError('Se requiere contraseña o token de autenticación');
    }

    let authUser;

    // Si se proporciona idToken, el usuario ya fue creado en el frontend
    if (userData.idToken) {
      // Verificar token y obtener usuario
      const decodedToken = await verifyIdToken(userData.idToken);
      authUser = await getAuthUser(decodedToken.uid);
    } else {
      // Crear usuario en Firebase Auth
      authUser = await createAuthUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name || userData.displayName,
        emailVerified: false
      });
    }

    // Verificar si el usuario ya existe en Firestore
    const usersCollection = collection(USERS_COLLECTION);
    const q = query(usersCollection, where('firebaseUid', '==', authUser.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Usuario ya existe, actualizar en lugar de crear
      const existingUser = docToObject(snapshot.docs[0]);
      const userDocRef = doc(USERS_COLLECTION, existingUser.id);

      const updateData = {
        name: userData.name || authUser.displayName || existingUser.name,
        email: authUser.email,
        updatedAt: FieldValue.serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);
      const updatedDoc = await getDoc(userDocRef);
      const updatedUser = docToObject(updatedDoc);

      logger.info('Usuario registrado (actualizado)', {
        uid: authUser.uid,
        email: authUser.email
      });

      return {
        user: {
          ...updatedUser,
          createdAt: updatedUser.createdAt?.toDate?.().toISOString() || null,
          updatedAt: updatedUser.updatedAt?.toDate?.().toISOString() || new Date().toISOString()
        },
        message: 'Usuario actualizado exitosamente'
      };
    }

    // Crear usuario en Firestore
    const newUserData = {
      firebaseUid: authUser.uid,
      email: authUser.email || userData.email,
      name: userData.name || authUser.displayName || '',
      emailVerified: authUser.emailVerified || false,
      photoURL: authUser.photoURL || null,
      role: userData.role || 'user',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp()
    };

    const docRef = await addDoc(usersCollection, newUserData);
    const createdDoc = await getDoc(docRef);
    const createdUser = docToObject(createdDoc);

    logger.info('Usuario registrado exitosamente', {
      uid: authUser.uid,
      firestoreId: docRef.id,
      email: authUser.email
    });

    return {
      user: {
        ...createdUser,
        createdAt: createdUser.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: createdUser.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
        lastLoginAt: createdUser.lastLoginAt?.toDate?.().toISOString() || new Date().toISOString()
      },
      message: 'Usuario registrado exitosamente'
    };
  } catch (error) {
    // Si es un error de validación o conflicto, dejarlo pasar
    if (error instanceof ValidationError || 
        error instanceof ConflictError ||
        error instanceof AuthenticationError) {
      throw error;
    }

    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      throw new ConflictError('El email ya está registrado');
    }

    logger.error('Error en registro', {
      email: userData.email,
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('Error al registrar usuario', {
      originalError: error.message
    });
  }
};

/**
 * Verifica un token de autenticación
 */
export const verifyToken = async (idToken) => {
  try {
    if (!idToken) {
      throw new ValidationError('Token de autenticación requerido');
    }

    const decodedToken = await verifyIdToken(idToken);
    const authUser = await getAuthUser(decodedToken.uid);

    return {
      valid: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        customClaims: decodedToken.custom_claims || {}
      }
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Obtiene el perfil completo de un usuario autenticado
 * Combina información de Firebase Auth y Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    // Obtener información de Firebase Auth
    const authUser = await getAuthUser(uid);

    // Buscar en Firestore
    const usersCollection = collection(USERS_COLLECTION);
    const q = query(usersCollection, where('firebaseUid', '==', uid));
    const snapshot = await getDocs(q);

    let firestoreUser = null;
    if (!snapshot.empty) {
      firestoreUser = docToObject(snapshot.docs[0]);
    }

    // Combinar información
    const profile = {
      uid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      name: authUser.displayName || firestoreUser?.name || '',
      photoURL: authUser.photoURL || firestoreUser?.photoURL || null,
      role: authUser.customClaims?.role || firestoreUser?.role || 'user',
      customClaims: authUser.customClaims || {},
      createdAt: firestoreUser?.createdAt?.toDate?.().toISOString() || null,
      updatedAt: firestoreUser?.updatedAt?.toDate?.().toISOString() || null,
      lastLoginAt: firestoreUser?.lastLoginAt?.toDate?.().toISOString() || null
    };

    return profile;
  } catch (error) {
    logger.error('Error al obtener perfil de usuario', {
      uid,
      error: error.message
    });
    throw new DatabaseError('Error al obtener perfil de usuario', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene un usuario de Firestore por Firebase UID
 */
export const getUserByFirebaseUid = async (firebaseUid) => {
  try {
    const usersCollection = collection(USERS_COLLECTION);
    const q = query(usersCollection, where('firebaseUid', '==', firebaseUid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const user = docToObject(snapshot.docs[0]);
    return {
      ...user,
      createdAt: user.createdAt?.toDate?.().toISOString() || null,
      updatedAt: user.updatedAt?.toDate?.().toISOString() || null,
      lastLoginAt: user.lastLoginAt?.toDate?.().toISOString() || null
    };
  } catch (error) {
    logger.error('Error al obtener usuario por Firebase UID', {
      firebaseUid,
      error: error.message
    });
    throw new DatabaseError('Error al obtener usuario', {
      originalError: error.message
    });
  }
};

export default {
  login,
  register,
  verifyToken,
  getUserProfile,
  syncUserToFirestore,
  getUserByFirebaseUid
};

