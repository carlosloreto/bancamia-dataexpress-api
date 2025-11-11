/**
 * Controlador de solicitudes de crédito
 * Maneja la lógica de negocio y validación de solicitudes
 */

import * as solicitudesService from '../services/solicitudes.service.js';
import { ValidationError, NotFoundError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/**
 * Valida los campos requeridos de la solicitud
 */
const validateSolicitudData = (data) => {
  const errors = [];
  const missingFields = [];

  // 1. Información Personal - Campos requeridos
  const personalFields = [
    'nombreCompleto',
    'tipoDocumento',
    'numeroDocumento',
    'fechaNacimiento',
    'estadoCivil',
    'genero',
    'telefono',
    'email',
    'direccion',
    'ciudad',
    'departamento'
  ];

  // 2. Información Laboral - Campos requeridos
  const laboralFields = [
    'ocupacion',
    'empresa',
    'cargoActual',
    'tipoContrato',
    'ingresosMensuales',
    'tiempoEmpleo'
  ];

  // 3. Información del Crédito - Campos requeridos
  const creditoFields = [
    'montoSolicitado',
    'plazoMeses',
    'proposito',
    'tieneDeudas'
  ];

  // 4. Referencias Personales - Campos requeridos
  const referenciasFields = [
    'refNombre1',
    'refTelefono1',
    'refRelacion1',
    'refNombre2',
    'refTelefono2',
    'refRelacion2'
  ];

  // Validar todos los campos requeridos
  const allRequiredFields = [
    ...personalFields,
    ...laboralFields,
    ...creditoFields,
    ...referenciasFields
  ];

  allRequiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });

  // Validación condicional: montoDeudas es requerido si tieneDeudas === 'si'
  if (data.tieneDeudas === 'si') {
    if (!data.montoDeudas || data.montoDeudas.trim() === '') {
      missingFields.push('montoDeudas');
    }
  }

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
  const tiposDocumentoValidos = ['CC', 'CE', 'PA', 'TI'];
  if (data.tipoDocumento && !tiposDocumentoValidos.includes(data.tipoDocumento)) {
    errors.push({
      type: 'invalid_value',
      field: 'tipoDocumento',
      message: 'Tipo de documento inválido',
      validValues: tiposDocumentoValidos
    });
  }

  // Validar estado civil
  const estadosCivilesValidos = ['soltero', 'casado', 'union', 'divorciado', 'viudo'];
  if (data.estadoCivil && !estadosCivilesValidos.includes(data.estadoCivil)) {
    errors.push({
      type: 'invalid_value',
      field: 'estadoCivil',
      message: 'Estado civil inválido',
      validValues: estadosCivilesValidos
    });
  }

  // Validar género
  const generosValidos = ['masculino', 'femenino', 'otro'];
  if (data.genero && !generosValidos.includes(data.genero)) {
    errors.push({
      type: 'invalid_value',
      field: 'genero',
      message: 'Género inválido',
      validValues: generosValidos
    });
  }

  // Validar tipo de contrato
  const tiposContratoValidos = ['indefinido', 'fijo', 'prestacion', 'independiente'];
  if (data.tipoContrato && !tiposContratoValidos.includes(data.tipoContrato)) {
    errors.push({
      type: 'invalid_value',
      field: 'tipoContrato',
      message: 'Tipo de contrato inválido',
      validValues: tiposContratoValidos
    });
  }

  // Validar tiempo de empleo
  const tiemposEmpleoValidos = ['menos6', '6a12', '1a2', '2a5', 'mas5'];
  if (data.tiempoEmpleo && !tiemposEmpleoValidos.includes(data.tiempoEmpleo)) {
    errors.push({
      type: 'invalid_value',
      field: 'tiempoEmpleo',
      message: 'Tiempo de empleo inválido',
      validValues: tiemposEmpleoValidos
    });
  }

  // Validar plazo en meses
  const plazosValidos = ['12', '24', '36', '48', '60', '72'];
  if (data.plazoMeses && !plazosValidos.includes(data.plazoMeses)) {
    errors.push({
      type: 'invalid_value',
      field: 'plazoMeses',
      message: 'Plazo en meses inválido',
      validValues: plazosValidos
    });
  }

  // Validar tieneDeudas
  const tieneDeudasValidos = ['si', 'no'];
  if (data.tieneDeudas && !tieneDeudasValidos.includes(data.tieneDeudas)) {
    errors.push({
      type: 'invalid_value',
      field: 'tieneDeudas',
      message: 'Valor de tieneDeudas inválido',
      validValues: tieneDeudasValidos
    });
  }

  // Validar que los montos sean números positivos
  if (data.montoSolicitado) {
    const monto = parseFloat(data.montoSolicitado);
    if (isNaN(monto) || monto <= 0) {
      errors.push({
        type: 'invalid_format',
        field: 'montoSolicitado',
        message: 'El monto solicitado debe ser un número positivo'
      });
    }
  }

  if (data.ingresosMensuales) {
    const ingresos = parseFloat(data.ingresosMensuales);
    if (isNaN(ingresos) || ingresos <= 0) {
      errors.push({
        type: 'invalid_format',
        field: 'ingresosMensuales',
        message: 'Los ingresos mensuales deben ser un número positivo'
      });
    }
  }

  if (data.montoDeudas && data.tieneDeudas === 'si') {
    const deudas = parseFloat(data.montoDeudas);
    if (isNaN(deudas) || deudas < 0) {
      errors.push({
        type: 'invalid_format',
        field: 'montoDeudas',
        message: 'El monto de deudas debe ser un número no negativo'
      });
    }
  }

  // Validar fecha de nacimiento (debe ser una fecha válida y en el pasado)
  if (data.fechaNacimiento) {
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

  return errors;
};

/**
 * Crear una nueva solicitud de crédito
 */
export const createSolicitud = async (req, res) => {
  // Log detallado para debugging en Cloud Run
  logger.info('POST /solicitudes recibido', {
    method: req.method,
    headers: req.headers,
    bodyKeys: Object.keys(req.body || {}),
    bodySize: JSON.stringify(req.body || {}).length,
    hasBody: !!req.body
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
  
  logger.info('Recibiendo nueva solicitud de crédito', {
    email: solicitudData.email,
    numeroDocumento: solicitudData.numeroDocumento
  });

  // Validar datos
  const validationErrors = validateSolicitudData(solicitudData);
  
  if (validationErrors.length > 0) {
    throw new ValidationError('Datos de solicitud inválidos', {
      errors: validationErrors
    });
  }

  // Crear solicitud en el servicio
  const newSolicitud = await solicitudesService.createSolicitud(solicitudData);
  
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
  
  logger.info('Obteniendo lista de solicitudes', { page, limit, search });
  
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
  
  logger.info('Obteniendo solicitud por ID', { id });
  
  const solicitud = await solicitudesService.getSolicitudById(id);
  
  if (!solicitud) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
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
  
  logger.info('Actualizando solicitud', { id, fields: Object.keys(updateData) });
  
  // Si se están actualizando campos, validar
  if (Object.keys(updateData).length > 0) {
    const validationErrors = validateSolicitudData({ ...updateData, email: updateData.email || 'temp@temp.com' });
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
  
  logger.info('Eliminando solicitud', { id });
  
  const deleted = await solicitudesService.deleteSolicitud(id);
  
  if (!deleted) {
    throw new NotFoundError(`Solicitud con ID ${id} no encontrada`);
  }
  
  res.status(200).json({
    success: true,
    message: 'Solicitud eliminada exitosamente'
  });
};

