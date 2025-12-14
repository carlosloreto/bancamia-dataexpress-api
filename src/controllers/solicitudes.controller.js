/**
 * Controlador de solicitudes de crédito
 * Maneja la lógica de negocio y validación de solicitudes
 */

import * as solicitudesService from '../services/solicitudes.service.js';
import { uploadPDF } from '../lib/storage.js';
import { generateSolicitudPDF } from '../lib/pdf-generator.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/**
 * Valida los campos requeridos de la solicitud
 */
const validateSolicitudData = (data) => {
  const errors = [];
  const missingFields = [];

  // Campos requeridos del formulario
  const requiredFields = [
    'email',
    'autorizacionTratamientoDatos',
    'autorizacionContacto',
    'nombreCompleto',
    'tipoDocumento',
    'numeroDocumento',
    'fechaNacimiento',
    'fechaExpedicionDocumento',
    'ciudadNegocio',
    'direccionNegocio',
    'celularNegocio',
    'referencia'
  ];

  // Validar campos requeridos
  requiredFields.forEach(field => {
    // Para campos booleanos, verificar que existan (pueden ser false)
    if (field === 'autorizacionTratamientoDatos' || field === 'autorizacionContacto') {
      if (data[field] === undefined || data[field] === null) {
        missingFields.push(field);
      }
    } else if (field === 'referencia') {
      // Para campo numérico, verificar que exista y sea válido
      if (data[field] === undefined || data[field] === null) {
        missingFields.push(field);
      }
    } else {
      // Para campos string, verificar que no estén vacíos
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
  });

  if (missingFields.length > 0) {
    errors.push({
      type: 'missing_fields',
      message: 'Faltan campos requeridos',
      fields: missingFields
    });
  }

  // Validaciones de formato
  // Email
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({
        type: 'invalid_format',
        field: 'email',
        message: 'El formato del email es inválido'
      });
    }
  }

  // Validar tipo de documento
  const tiposDocumentoValidos = ['CC', 'CE', 'PA', 'PEP', 'PPP'];
  if (data.tipoDocumento && !tiposDocumentoValidos.includes(data.tipoDocumento)) {
    errors.push({
      type: 'invalid_value',
      field: 'tipoDocumento',
      message: 'Tipo de documento inválido',
      validValues: tiposDocumentoValidos
    });
  }

  // Validar autorizaciones (pueden ser booleanos o strings 'true'/'false')
  if (data.autorizacionTratamientoDatos !== undefined) {
    const isValid = typeof data.autorizacionTratamientoDatos === 'boolean' || 
                    data.autorizacionTratamientoDatos === 'true' || 
                    data.autorizacionTratamientoDatos === 'false';
    if (!isValid) {
      errors.push({
        type: 'invalid_format',
        field: 'autorizacionTratamientoDatos',
        message: 'La autorización de tratamiento de datos debe ser un valor booleano'
      });
    }
  }

  if (data.autorizacionContacto !== undefined) {
    const isValid = typeof data.autorizacionContacto === 'boolean' || 
                    data.autorizacionContacto === 'true' || 
                    data.autorizacionContacto === 'false';
    if (!isValid) {
      errors.push({
        type: 'invalid_format',
        field: 'autorizacionContacto',
        message: 'La autorización de contacto debe ser un valor booleano'
      });
    }
  }

  // Validar formato de fecha (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (data.fechaNacimiento) {
    if (!dateRegex.test(data.fechaNacimiento)) {
      errors.push({
        type: 'invalid_format',
        field: 'fechaNacimiento',
        message: 'La fecha de nacimiento debe tener el formato YYYY-MM-DD'
      });
    } else {
      const fecha = new Date(data.fechaNacimiento);
      const hoy = new Date();
      
      if (isNaN(fecha.getTime())) {
        errors.push({
          type: 'invalid_format',
          field: 'fechaNacimiento',
          message: 'La fecha de nacimiento no es válida'
        });
      } else if (fecha >= hoy) {
        errors.push({
          type: 'invalid_value',
          field: 'fechaNacimiento',
          message: 'La fecha de nacimiento debe ser anterior a hoy'
        });
      }
      
      // Validar edad mínima (18 años)
      const edad = Math.floor((hoy - fecha) / (365.25 * 24 * 60 * 60 * 1000));
      if (edad < 18) {
        errors.push({
          type: 'invalid_value',
          field: 'fechaNacimiento',
          message: 'El solicitante debe ser mayor de 18 años'
        });
      }
    }
  }

  if (data.fechaExpedicionDocumento) {
    if (!dateRegex.test(data.fechaExpedicionDocumento)) {
      errors.push({
        type: 'invalid_format',
        field: 'fechaExpedicionDocumento',
        message: 'La fecha de expedición del documento debe tener el formato YYYY-MM-DD'
      });
    } else {
      const fecha = new Date(data.fechaExpedicionDocumento);
      const hoy = new Date();
      
      if (isNaN(fecha.getTime())) {
        errors.push({
          type: 'invalid_format',
          field: 'fechaExpedicionDocumento',
          message: 'La fecha de expedición del documento no es válida'
        });
      } else if (fecha > hoy) {
        errors.push({
          type: 'invalid_value',
          field: 'fechaExpedicionDocumento',
          message: 'La fecha de expedición del documento no puede ser futura'
        });
      }
    }
  }

  // Validar formato de teléfono (celularNegocio)
  if (data.celularNegocio) {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(data.celularNegocio)) {
      errors.push({
        type: 'invalid_format',
        field: 'celularNegocio',
        message: 'El formato del celular del negocio es inválido'
      });
    }
  }

  // Validar referencia (debe ser un número entero válido)
  if (data.referencia !== undefined && data.referencia !== null) {
    const referenciaNum = Number(data.referencia);
    if (isNaN(referenciaNum) || !Number.isFinite(referenciaNum)) {
      errors.push({
        type: 'invalid_format',
        field: 'referencia',
        message: 'La referencia debe ser un número válido'
      });
    } else if (!Number.isInteger(referenciaNum)) {
      errors.push({
        type: 'invalid_format',
        field: 'referencia',
        message: 'La referencia debe ser un número entero'
      });
    }
  }

  return errors;
};

/**
 * Crear una nueva solicitud de crédito
 */
export const createSolicitud = async (req, res) => {
  // Log detallado para debugging en Cloud Run
  logger.info('POST /solicitudes recibido', {
    method: req.method,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    bodyKeys: Object.keys(req.body || {}),
    bodySize: JSON.stringify(req.body || {}).length,
    hasBody: !!req.body,
    bodyType: typeof req.body,
    isArray: Array.isArray(req.body),
    userId: req.user?.uid
  });
  
  const solicitudData = req.body;
  
  if (!solicitudData || Object.keys(solicitudData).length === 0) {
    logger.error('Body vacío o no parseado', {
      contentType: req.get('Content-Type'),
      body: req.body
    });
    throw new ValidationError('El cuerpo de la solicitud está vacío o no es válido', {
      errors: [{ type: 'empty_body', message: 'No se recibieron datos en el cuerpo de la solicitud' }]
    });
  }
  
  // Agregar userId del usuario autenticado
  if (req.user && req.user.uid) {
    solicitudData.userId = req.user.uid;
  }
  
  logger.info('Recibiendo nueva solicitud de crédito', {
    email: solicitudData.email,
    numeroDocumento: solicitudData.numeroDocumento,
    userId: solicitudData.userId
  });

  // Validar datos
  const validationErrors = validateSolicitudData(solicitudData);
  
  if (validationErrors.length > 0) {
    throw new ValidationError('Datos de solicitud inválidos', {
      errors: validationErrors
    });
  }

  // Generar ID temporal para organizar el archivo en Storage
  const tempId = `${Date.now()}_${solicitudData.numeroDocumento || 'unknown'}`;
  
  // Generar PDF con los datos de la solicitud
  // IMPORTANTE: El PDF es obligatorio, si falla no se debe guardar la solicitud
  let documentoInfo = null;
  try {
    logger.info('[PDF-1] Iniciando generación de PDF', {
      numeroDocumento: solicitudData.numeroDocumento,
      email: solicitudData.email,
      tempId
    });
    
    // Generar el PDF
    const pdfBuffer = await generateSolicitudPDF(solicitudData);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      logger.error('[PDF-ERROR] PDF generado está vacío');
      throw new Error('El PDF generado está vacío');
    }
    
    // Nombre del archivo PDF
    const fileName = `solicitud_${solicitudData.numeroDocumento || 'unknown'}_${Date.now()}.pdf`;
    
    logger.info('[PDF-2] PDF generado exitosamente', {
      fileName,
      size: pdfBuffer.length,
      bufferType: typeof pdfBuffer,
      isBuffer: Buffer.isBuffer(pdfBuffer)
    });
    
    // Subir PDF generado a Firebase Storage
    logger.info('[PDF-3] Iniciando subida a Firebase Storage', {
      fileName,
      tempId,
      bufferSize: pdfBuffer.length
    });
    
    documentoInfo = await uploadPDF(
      pdfBuffer,
      fileName,
      tempId
    );
    
    logger.info('[PDF-4] Respuesta de uploadPDF recibida', {
      documentoInfo: documentoInfo ? JSON.stringify(documentoInfo) : 'null',
      tieneUrl: !!documentoInfo?.url,
      tipo: typeof documentoInfo
    });
    
    if (!documentoInfo || !documentoInfo.url) {
      logger.error('[PDF-ERROR] documentoInfo inválido después de uploadPDF', {
        documentoInfo: documentoInfo ? JSON.stringify(documentoInfo) : 'null',
        tieneUrl: !!documentoInfo?.url
      });
      throw new Error('No se pudo obtener la URL del PDF subido');
    }
    
    logger.info('[PDF-5] PDF subido exitosamente a Firebase Storage', {
      url: documentoInfo.url,
      path: documentoInfo.path,
      fileName: documentoInfo.fileName,
      originalName: documentoInfo.originalName,
      documentoInfoCompleto: JSON.stringify(documentoInfo)
    });
  } catch (pdfError) {
    logger.error('Error al generar o subir PDF', {
      error: pdfError.message,
      stack: pdfError.stack,
      numeroDocumento: solicitudData.numeroDocumento
    });
    // Lanzar error para que no se guarde la solicitud sin PDF
    throw new ValidationError('Error al generar el documento PDF', {
      errors: [{
        type: 'pdf_generation_error',
        field: 'documento',
        message: `No se pudo generar el documento PDF: ${pdfError.message}`
      }]
    });
  }

  // Verificar que documentoInfo se haya creado correctamente
  if (!documentoInfo || !documentoInfo.url) {
    logger.error('documentoInfo no válido después de generar PDF', {
      documentoInfo
    });
    throw new ValidationError('Error al generar el documento PDF', {
      errors: [{
        type: 'pdf_generation_error',
        field: 'documento',
        message: 'El documento PDF no se generó correctamente'
      }]
    });
  }

  // Agregar información del documento a los datos de la solicitud
  logger.info('[CONTROLLER-1] Antes de agregar documento a solicitudData', {
    documentoInfo: documentoInfo ? JSON.stringify(documentoInfo) : 'null',
    solicitudDataKeys: Object.keys(solicitudData),
    tieneDocumentoAntes: 'documento' in solicitudData
  });
  
  solicitudData.documento = documentoInfo;
  
  logger.info('[CONTROLLER-2] Documento agregado a solicitudData', {
    documento: documentoInfo ? JSON.stringify(documentoInfo) : 'null',
    tieneDocumentoDespues: 'documento' in solicitudData,
    solicitudDataCompleto: JSON.stringify(solicitudData),
    documentoUrl: documentoInfo?.url || 'N/A'
  });

  // Crear solicitud en el servicio
  logger.info('[CONTROLLER-3] Llamando a solicitudesService.createSolicitud', {
    solicitudDataKeys: Object.keys(solicitudData),
    tieneDocumento: 'documento' in solicitudData,
    documento: solicitudData.documento ? JSON.stringify(solicitudData.documento) : 'null'
  });
  
  const newSolicitud = await solicitudesService.createSolicitud(solicitudData);
  
  logger.info('[CONTROLLER-4] Solicitud creada, verificando respuesta del servicio', {
    solicitudId: newSolicitud.id,
    tieneDocumento: 'documento' in newSolicitud,
    documentoPresente: !!newSolicitud.documento,
    documento: newSolicitud.documento ? JSON.stringify(newSolicitud.documento) : 'null',
    documentoUrl: newSolicitud.documento?.url || 'N/A',
    newSolicitudKeys: Object.keys(newSolicitud)
  });
  
  logger.info('[CONTROLLER-5] Enviando respuesta al cliente', {
    responseData: JSON.stringify({
      success: true,
      message: 'Solicitud de crédito creada exitosamente',
      data: newSolicitud
    })
  });
  
  res.status(201).json({
    success: true,
    message: 'Solicitud de crédito creada exitosamente',
    data: newSolicitud
  });
};

/**
 * Obtener todas las solicitudes
 */
export const getAllSolicitudes = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const { uid: currentUserId, customClaims } = req.user || {};
  const isAdmin = customClaims?.role === 'admin' || req.user?.role === 'admin';
  
  logger.info('Obteniendo lista de solicitudes', { 
    page, 
    limit, 
    search,
    userId: currentUserId,
    isAdmin 
  });

  // Devolver todas las solicitudes sin filtrar por userId
  const result = await solicitudesService.getSolicitudes({
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });
  
  res.status(200).json({
    success: true,
    data: result.solicitudes,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
};

/**
 * Obtener una solicitud por ID
 */
export const getSolicitudById = async (req, res) => {
  const { id } = req.params;
  const { uid: currentUserId, customClaims } = req.user || {};
  const isAdmin = customClaims?.role === 'admin' || req.user?.role === 'admin';
  
  logger.info('Obteniendo solicitud por ID', { id, userId: currentUserId, isAdmin });
  
  const solicitud = await solicitudesService.getSolicitudById(id);
  
  if (!solicitud) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
  }

  // Verificar ownership: solo el dueño o admin puede ver la solicitud
  if (!isAdmin && solicitud.userId !== currentUserId) {
    throw new AuthorizationError('No tienes permiso para ver esta solicitud');
  }
  
  res.status(200).json({
    success: true,
    data: solicitud
  });
};

/**
 * Actualizar una solicitud
 */
export const updateSolicitud = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const { uid: currentUserId, customClaims } = req.user || {};
  const isAdmin = customClaims?.role === 'admin' || req.user?.role === 'admin';
  
  logger.info('Actualizando solicitud', { id, fields: Object.keys(updateData), userId: currentUserId, isAdmin });

  // Obtener la solicitud para verificar ownership
  const solicitud = await solicitudesService.getSolicitudById(id);
  
  if (!solicitud) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
  }

  // Verificar ownership: solo el dueño o admin puede actualizar
  if (!isAdmin && solicitud.userId !== currentUserId) {
    throw new AuthorizationError('No tienes permiso para actualizar esta solicitud');
  }
  
  // Si se están actualizando campos, validar solo formato (no campos faltantes)
  if (Object.keys(updateData).length > 0) {
    // Crear objeto temporal con valores por defecto para validar formato
    const tempData = {
      email: updateData.email || 'temp@temp.com',
      autorizacionTratamientoDatos: updateData.autorizacionTratamientoDatos !== undefined ? updateData.autorizacionTratamientoDatos : true,
      autorizacionContacto: updateData.autorizacionContacto !== undefined ? updateData.autorizacionContacto : true,
      nombreCompleto: updateData.nombreCompleto || 'temp',
      tipoDocumento: updateData.tipoDocumento || 'CC',
      numeroDocumento: updateData.numeroDocumento || '123456789',
      fechaNacimiento: updateData.fechaNacimiento || '1990-01-01',
      fechaExpedicionDocumento: updateData.fechaExpedicionDocumento || '2010-01-01',
      ciudadNegocio: updateData.ciudadNegocio || '201',
      direccionNegocio: updateData.direccionNegocio || 'temp',
      celularNegocio: updateData.celularNegocio || '3001234567',
      ...updateData
    };
    
    const validationErrors = validateSolicitudData(tempData);
    // Filtrar solo errores de formato, no de campos faltantes
    const formatErrors = validationErrors.filter(err => err.type !== 'missing_fields');
    
    if (formatErrors.length > 0) {
      throw new ValidationError('Datos de actualización inválidos', {
        errors: formatErrors
      });
    }
  }
  
  const updatedSolicitud = await solicitudesService.updateSolicitud(id, updateData);
  
  if (!updatedSolicitud) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
  }
  
  res.status(200).json({
    success: true,
    message: 'Solicitud actualizada exitosamente',
    data: updatedSolicitud
  });
};

/**
 * Eliminar una solicitud
 */
export const deleteSolicitud = async (req, res) => {
  const { id } = req.params;
  const { uid: currentUserId, customClaims } = req.user || {};
  const isAdmin = customClaims?.role === 'admin' || req.user?.role === 'admin';
  
  logger.info('Eliminando solicitud', { id, userId: currentUserId, isAdmin });

  // Obtener la solicitud para verificar ownership
  const solicitud = await solicitudesService.getSolicitudById(id);
  
  if (!solicitud) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
  }

  // Verificar ownership: solo el dueño o admin puede eliminar
  if (!isAdmin && solicitud.userId !== currentUserId) {
    throw new AuthorizationError('No tienes permiso para eliminar esta solicitud');
  }
  
  const deleted = await solicitudesService.deleteSolicitud(id);
  
  if (!deleted) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
  }
  
  res.status(200).json({
    success: true,
    message: 'Solicitud eliminada exitosamente'
  });
};

