/**
 * Servicio de usuarios con Firestore Client SDK
 * Contiene la lógica de negocio y acceso a datos
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  docToObject,
  snapshotToArray,
  FieldValue
} from '../lib/firestore-client.js';
import { ConflictError, DatabaseError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

// Nombre de la colección en Firestore
const USERS_COLLECTION = 'users';

/**
 * Obtiene lista de usuarios con paginación y búsqueda
 */
export const getUsers = async ({ page = 1, limit = 10, search = '' }) => {
  try {
    const usersCollection = collection(USERS_COLLECTION);
    
    // Obtener todos los documentos
    const snapshot = await getDocs(usersCollection);
    let users = snapshotToArray(snapshot);
    
    // Filtrar en memoria si hay búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    users.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA;
    });
    
    // Calcular paginación
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    // Convertir timestamps a formato ISO
    const formattedUsers = paginatedUsers.map(user => ({
      ...user,
      createdAt: user.createdAt?.toDate?.().toISOString() || user.createdAt?.toISOString?.() || null,
      updatedAt: user.updatedAt?.toDate?.().toISOString() || user.updatedAt?.toISOString?.() || null
    }));
    
    logger.debug('Usuarios obtenidos de Firestore', { total, page, limit });
    
    return {
      users: formattedUsers,
      page,
      limit,
      total,
      totalPages
    };
  } catch (error) {
    logger.error('Error al obtener usuarios de Firestore', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('Error al obtener usuarios', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene un usuario por ID
 */
export const getUserById = async (id) => {
  try {
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    const user = docToObject(userDoc);
    
    if (!user) {
      return null;
    }
    
    // Convertir timestamps a formato ISO
    return {
      ...user,
      createdAt: user.createdAt?.toDate?.().toISOString() || user.createdAt?.toISOString?.() || null,
      updatedAt: user.updatedAt?.toDate?.().toISOString() || user.updatedAt?.toISOString?.() || null
    };
  } catch (error) {
    logger.error('Error al obtener usuario por ID de Firestore', {
      userId: id,
      error: error.message
    });
    throw new DatabaseError('Error al obtener usuario', {
      originalError: error.message
    });
  }
};

/**
 * Crea un nuevo usuario
 */
export const createUser = async (userData) => {
  try {
    // Verificar si el email ya existe
    const usersCollection = collection(USERS_COLLECTION);
    const q = query(usersCollection, where('email', '==', userData.email));
    const existingUsersSnapshot = await getDocs(q);
    
    if (!existingUsersSnapshot.empty) {
      throw new ConflictError('El email ya está registrado', {
        field: 'email',
        value: userData.email
      });
    }
    
    // Crear nuevo documento
    const newUser = {
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      firebaseUid: userData.firebaseUid || null,
      emailVerified: userData.emailVerified || false,
      photoURL: userData.photoURL || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    const docRef = await addDoc(usersCollection, newUser);
    
    logger.info('Usuario creado en Firestore', {
      id: docRef.id,
      email: newUser.email
    });
    
    // Obtener el documento creado
    const createdDoc = await getDoc(docRef);
    const createdUser = docToObject(createdDoc);
    
    return {
      ...createdUser,
      createdAt: createdUser.createdAt?.toDate?.().toISOString() || new Date().toISOString()
    };
  } catch (error) {
    // Si es un error de conflicto, dejarlo pasar
    if (error instanceof ConflictError) {
      throw error;
    }
    
    logger.error('Error al crear usuario en Firestore', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('Error al crear usuario', {
      originalError: error.message
    });
  }
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (id, updateData) => {
  try {
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const currentData = userDoc.data();
    
    // Si se actualiza el email, verificar que no exista
    if (updateData.email && updateData.email !== currentData.email) {
      const usersCollection = collection(USERS_COLLECTION);
      const q = query(usersCollection, where('email', '==', updateData.email));
      const existingUsersSnapshot = await getDocs(q);
      
      if (!existingUsersSnapshot.empty) {
        throw new ConflictError('El email ya está registrado', {
          field: 'email',
          value: updateData.email
        });
      }
    }
    
    // Preparar datos de actualización
    const dataToUpdate = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    // No permitir actualizar estos campos
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    
    await updateDoc(userDocRef, dataToUpdate);
    
    logger.info('Usuario actualizado en Firestore', {
      id,
      fields: Object.keys(updateData)
    });
    
    // Obtener el documento actualizado
    const updatedDoc = await getDoc(userDocRef);
    const updatedUser = docToObject(updatedDoc);
    
    return {
      ...updatedUser,
      createdAt: updatedUser.createdAt?.toDate?.().toISOString() || null,
      updatedAt: updatedUser.updatedAt?.toDate?.().toISOString() || null
    };
  } catch (error) {
    // Si es un error de conflicto, dejarlo pasar
    if (error instanceof ConflictError) {
      throw error;
    }
    
    logger.error('Error al actualizar usuario en Firestore', {
      userId: id,
      error: error.message
    });
    throw new DatabaseError('Error al actualizar usuario', {
      originalError: error.message
    });
  }
};

/**
 * Elimina un usuario
 */
export const deleteUser = async (id) => {
  try {
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    await deleteDoc(userDocRef);
    
    logger.info('Usuario eliminado de Firestore', { id });
    
    return true;
  } catch (error) {
    logger.error('Error al eliminar usuario de Firestore', {
      userId: id,
      error: error.message
    });
    throw new DatabaseError('Error al eliminar usuario', {
      originalError: error.message
    });
  }
};

/**
 * Cuenta el total de usuarios (útil para estadísticas)
 */
export const countUsers = async () => {
  try {
    const usersCollection = collection(USERS_COLLECTION);
    const snapshot = await getDocs(usersCollection);
    return snapshot.size;
  } catch (error) {
    logger.error('Error al contar usuarios', { error: error.message });
    throw new DatabaseError('Error al contar usuarios', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene un usuario por Firebase UID
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
      createdAt: user.createdAt?.toDate?.().toISOString() || user.createdAt?.toISOString?.() || null,
      updatedAt: user.updatedAt?.toDate?.().toISOString() || user.updatedAt?.toISOString?.() || null,
      lastLoginAt: user.lastLoginAt?.toDate?.().toISOString() || user.lastLoginAt?.toISOString?.() || null
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
