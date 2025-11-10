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
 */
export const createSolicitud = async (solicitudData) => {
  try {
    // Verificar si ya existe una solicitud con el mismo número de documento
    const solicitudesCollection = collection(SOLICITUDES_COLLECTION);
    const q = query(
      solicitudesCollection,
      where('numeroDocumento', '==', solicitudData.numeroDocumento)
    );
    const existingSolicitudesSnapshot = await getDocs(q);
    
    // Opcional: permitir múltiples solicitudes del mismo documento
    // Si quieres prevenir esto, descomenta el siguiente código:
    /*
    if (!existingSolicitudesSnapshot.empty) {
      throw new ConflictError('Ya existe una solicitud con este número de documento', {
        field: 'numeroDocumento',
        value: solicitudData.numeroDocumento
      });
    }
    */

    // Preparar datos de la solicitud
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
      ingresosMensuales: solicitudData.ingresosMensuales,
      tiempoEmpleo: solicitudData.tiempoEmpleo,

      // 3. Información del Crédito
      montoSolicitado: solicitudData.montoSolicitado,
      plazoMeses: solicitudData.plazoMeses,
      proposito: solicitudData.proposito,
      tieneDeudas: solicitudData.tieneDeudas,
      montoDeudas: solicitudData.montoDeudas || null,

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

    // Guardar en Firestore
    const docRef = await addDoc(solicitudesCollection, newSolicitud);

    logger.info('Solicitud de crédito creada en Firestore', {
      id: docRef.id,
      numeroDocumento: newSolicitud.numeroDocumento,
      email: newSolicitud.email
    });

    // Obtener el documento creado
    const createdDoc = await getDoc(docRef);
    const createdSolicitud = docToObject(createdDoc);

    // Formatear timestamps
    return formatSolicitud(createdSolicitud);
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
 */
export const getSolicitudes = async ({ page = 1, limit = 10, search = '' }) => {
  try {
    const solicitudesCollection = collection(SOLICITUDES_COLLECTION);

    // Obtener todos los documentos
    const snapshot = await getDocs(solicitudesCollection);
    let solicitudes = snapshotToArray(snapshot);

    // Filtrar en memoria si hay búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      solicitudes = solicitudes.filter(solicitud =>
        solicitud.nombreCompleto?.toLowerCase().includes(searchLower) ||
        solicitud.numeroDocumento?.toLowerCase().includes(searchLower) ||
        solicitud.email?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    solicitudes.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA;
    });

    // Calcular paginación
    const total = solicitudes.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedSolicitudes = solicitudes.slice(startIndex, endIndex);

    // Formatear timestamps
    const formattedSolicitudes = paginatedSolicitudes.map(formatSolicitud);

    logger.debug('Solicitudes obtenidas de Firestore', { total, page, limit });

    return {
      solicitudes: formattedSolicitudes,
      page,
      limit,
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
 */
export const updateSolicitud = async (id, updateData) => {
  try {
    const solicitudDocRef = doc(SOLICITUDES_COLLECTION, id);
    const solicitudDoc = await getDoc(solicitudDocRef);

    if (!solicitudDoc.exists()) {
      return null;
    }

    // Preparar datos de actualización
    const dataToUpdate = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };

    // No permitir actualizar estos campos
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.fechaSolicitud;

    await updateDoc(solicitudDocRef, dataToUpdate);

    logger.info('Solicitud actualizada en Firestore', {
      id,
      fields: Object.keys(updateData)
    });

    // Obtener el documento actualizado
    const updatedDoc = await getDoc(solicitudDocRef);
    const updatedSolicitud = docToObject(updatedDoc);

    return formatSolicitud(updatedSolicitud);
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

