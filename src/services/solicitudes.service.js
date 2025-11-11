/**
 * Servicio de solicitudes de crédito con Firestore
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
  orderBy,
  limit,
  docToObject,
  snapshotToArray,
  FieldValue
} from '../lib/firestore-client.js';
import { ConflictError, DatabaseError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

// Nombre de la colección en Firestore
const SOLICITUDES_COLLECTION = 'solicitudes';

/**
 * Crea una nueva solicitud de crédito
 * OPTIMIZADO: Eliminada query innecesaria y doble lectura
 */
export const createSolicitud = async (solicitudData) => {
  try {
    const solicitudesCollection = collection(SOLICITUDES_COLLECTION);

    // Preparar datos de la solicitud con conversión de números
    const newSolicitud = {
      // 1. Información Personal
      nombreCompleto: solicitudData.nombreCompleto,
      tipoDocumento: solicitudData.tipoDocumento,
      numeroDocumento: solicitudData.numeroDocumento,
      fechaNacimiento: solicitudData.fechaNacimiento,
      estadoCivil: solicitudData.estadoCivil,
      genero: solicitudData.genero,
      telefono: solicitudData.telefono,
      email: solicitudData.email,
      direccion: solicitudData.direccion,
      ciudad: solicitudData.ciudad,
      departamento: solicitudData.departamento,

      // 2. Información Laboral
      ocupacion: solicitudData.ocupacion,
      empresa: solicitudData.empresa,
      cargoActual: solicitudData.cargoActual,
      tipoContrato: solicitudData.tipoContrato,
      // Convertir a número para mejor rendimiento en Firestore
      ingresosMensuales: solicitudData.ingresosMensuales ? 
        parseFloat(solicitudData.ingresosMensuales) : 0,
      tiempoEmpleo: solicitudData.tiempoEmpleo,

      // 3. Información del Crédito
      // Convertir a número para mejor rendimiento en Firestore
      montoSolicitado: solicitudData.montoSolicitado ? 
        parseFloat(solicitudData.montoSolicitado) : 0,
      plazoMeses: solicitudData.plazoMeses,
      proposito: solicitudData.proposito,
      tieneDeudas: solicitudData.tieneDeudas,
      // Convertir a número o null
      montoDeudas: solicitudData.montoDeudas ? 
        parseFloat(solicitudData.montoDeudas) : null,

      // 4. Referencias Personales
      refNombre1: solicitudData.refNombre1,
      refTelefono1: solicitudData.refTelefono1,
      refRelacion1: solicitudData.refRelacion1,
      refNombre2: solicitudData.refNombre2,
      refTelefono2: solicitudData.refTelefono2,
      refRelacion2: solicitudData.refRelacion2,

      // 5. Campos del sistema
      fechaSolicitud: FieldValue.serverTimestamp(),
      estado: 'pendiente', // Estados: pendiente, en_revision, aprobado, rechazado
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    // Guardar en Firestore (una sola operación)
    const docRef = await addDoc(solicitudesCollection, newSolicitud);

    logger.info('Solicitud de crédito creada en Firestore', {
      id: docRef.id,
      numeroDocumento: newSolicitud.numeroDocumento,
      email: newSolicitud.email
    });

    // Construir respuesta directamente sin leer de nuevo (OPTIMIZACIÓN)
    // Nota: Los timestamps se establecerán en el servidor, usamos fecha actual como aproximación
    const now = new Date().toISOString();
    
    // Crear copia sin FieldValue objects para la respuesta
    const responseData = { ...newSolicitud };
    responseData.fechaSolicitud = now;
    responseData.createdAt = now;
    responseData.updatedAt = now;
    
    return {
      id: docRef.id,
      ...responseData
    };
  } catch (error) {
    // Si es un error de conflicto, dejarlo pasar
    if (error instanceof ConflictError) {
      throw error;
    }

    logger.error('Error al crear solicitud en Firestore', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('Error al crear solicitud de crédito', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene lista de solicitudes con paginación y búsqueda
 * OPTIMIZADO: Usa límites de Firestore y orderBy en lugar de cargar todo en memoria
 */
export const getSolicitudes = async ({ page = 1, limit: pageLimit = 10, search = '' }) => {
  try {
    const solicitudesCollection = collection(SOLICITUDES_COLLECTION);
    
    let q;
    const maxLimit = 100; // Límite máximo para evitar cargar demasiados documentos
    
    // Optimización: Si hay búsqueda, usar filtro en Firestore
    if (search && search.length >= 3) {
      // Búsqueda por número de documento (más eficiente con índices)
      q = query(
        solicitudesCollection,
        where('numeroDocumento', '>=', search),
        where('numeroDocumento', '<=', search + '\uf8ff'),
        orderBy('numeroDocumento'),
        limit(Math.min(pageLimit * page, maxLimit))
      );
    } else {
      // Sin búsqueda: ordenar por fecha y paginar
      q = query(
        solicitudesCollection,
        orderBy('createdAt', 'desc'),
        limit(Math.min(pageLimit * page, maxLimit))
      );
    }

    const snapshot = await getDocs(q);
    let solicitudes = snapshotToArray(snapshot);

    // Si hay búsqueda, filtrar también por nombre y email en memoria (para búsquedas cortas)
    if (search) {
      const searchLower = search.toLowerCase();
      solicitudes = solicitudes.filter(solicitud =>
        solicitud.nombreCompleto?.toLowerCase().includes(searchLower) ||
        solicitud.numeroDocumento?.toLowerCase().includes(searchLower) ||
        solicitud.email?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por fecha si no se ordenó en la query
    if (!search || search.length < 3) {
      solicitudes.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB - dateA;
      });
    }

    // Calcular paginación
    const total = solicitudes.length;
    const totalPages = Math.ceil(total / pageLimit);
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;

    const paginatedSolicitudes = solicitudes.slice(startIndex, endIndex);

    // Formatear timestamps
    const formattedSolicitudes = paginatedSolicitudes.map(formatSolicitud);

    logger.debug('Solicitudes obtenidas de Firestore', { total, page, limit: pageLimit });

    return {
      solicitudes: formattedSolicitudes,
      page,
      limit: pageLimit,
      total,
      totalPages
    };
  } catch (error) {
    logger.error('Error al obtener solicitudes de Firestore', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('Error al obtener solicitudes', {
      originalError: error.message
    });
  }
};

/**
 * Obtiene una solicitud por ID
 */
export const getSolicitudById = async (id) => {
  try {
    const solicitudDocRef = doc(SOLICITUDES_COLLECTION, id);
    const solicitudDoc = await getDoc(solicitudDocRef);
    const solicitud = docToObject(solicitudDoc);

    if (!solicitud) {
      return null;
    }

    // Formatear timestamps
    return formatSolicitud(solicitud);
  } catch (error) {
    logger.error('Error al obtener solicitud por ID de Firestore', {
      solicitudId: id,
      error: error.message
    });
    throw new DatabaseError('Error al obtener solicitud', {
      originalError: error.message
    });
  }
};

/**
 * Actualiza una solicitud
 * OPTIMIZADO: Eliminada doble lectura, construye respuesta directamente
 */
export const updateSolicitud = async (id, updateData) => {
  try {
    const solicitudDocRef = doc(SOLICITUDES_COLLECTION, id);
    const solicitudDoc = await getDoc(solicitudDocRef);

    if (!solicitudDoc.exists()) {
      return null;
    }

    // Convertir números si están presentes
    const dataToUpdate = { ...updateData };
    
    if (dataToUpdate.ingresosMensuales) {
      dataToUpdate.ingresosMensuales = parseFloat(dataToUpdate.ingresosMensuales);
    }
    if (dataToUpdate.montoSolicitado) {
      dataToUpdate.montoSolicitado = parseFloat(dataToUpdate.montoSolicitado);
    }
    if (dataToUpdate.montoDeudas !== undefined) {
      dataToUpdate.montoDeudas = dataToUpdate.montoDeudas ? 
        parseFloat(dataToUpdate.montoDeudas) : null;
    }

    dataToUpdate.updatedAt = FieldValue.serverTimestamp();

    // No permitir actualizar estos campos
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.fechaSolicitud;

    await updateDoc(solicitudDocRef, dataToUpdate);

    logger.info('Solicitud actualizada en Firestore', {
      id,
      fields: Object.keys(updateData)
    });

    // Construir respuesta combinando datos existentes con actualización (OPTIMIZACIÓN)
    const existingData = docToObject(solicitudDoc);
    const now = new Date().toISOString();
    
    return formatSolicitud({
      ...existingData,
      ...dataToUpdate,
      updatedAt: now
    });
  } catch (error) {
    logger.error('Error al actualizar solicitud en Firestore', {
      solicitudId: id,
      error: error.message
    });
    throw new DatabaseError('Error al actualizar solicitud', {
      originalError: error.message
    });
  }
};

/**
 * Elimina una solicitud
 */
export const deleteSolicitud = async (id) => {
  try {
    const solicitudDocRef = doc(SOLICITUDES_COLLECTION, id);
    const solicitudDoc = await getDoc(solicitudDocRef);

    if (!solicitudDoc.exists()) {
      return false;
    }

    await deleteDoc(solicitudDocRef);

    logger.info('Solicitud eliminada de Firestore', { id });

    return true;
  } catch (error) {
    logger.error('Error al eliminar solicitud de Firestore', {
      solicitudId: id,
      error: error.message
    });
    throw new DatabaseError('Error al eliminar solicitud', {
      originalError: error.message
    });
  }
};

/**
 * Formatea una solicitud para la respuesta
 * Convierte timestamps a formato ISO
 */
const formatSolicitud = (solicitud) => {
  if (!solicitud) return null;

  return {
    ...solicitud,
    fechaSolicitud: solicitud.fechaSolicitud?.toDate?.().toISOString() || 
                    solicitud.fechaSolicitud?.toISOString?.() || null,
    createdAt: solicitud.createdAt?.toDate?.().toISOString() || 
               solicitud.createdAt?.toISOString?.() || null,
    updatedAt: solicitud.updatedAt?.toDate?.().toISOString() || 
               solicitud.updatedAt?.toISOString?.() || null
  };
};

/**
 * Cuenta el total de solicitudes (útil para estadísticas)
 */
export const countSolicitudes = async () => {
  try {
    const solicitudesCollection = collection(SOLICITUDES_COLLECTION);
    const snapshot = await getDocs(solicitudesCollection);
    return snapshot.size;
  } catch (error) {
    logger.error('Error al contar solicitudes', { error: error.message });
    throw new DatabaseError('Error al contar solicitudes', {
      originalError: error.message
    });
  }
};

