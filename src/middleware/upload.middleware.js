/**
 * Middleware para manejo de uploads de archivos
 * Usa multer para procesar archivos multipart/form-data
 */

import multer from 'multer';
import { ValidationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

// Configuración de almacenamiento en memoria (para luego subir a Firebase Storage)
const storage = multer.memoryStorage();

// Tipos MIME permitidos para PDFs
const ALLOWED_MIME_TYPES = ['application/pdf'];

// Tamaño máximo del archivo (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Filtro para validar que el archivo sea PDF
 */
const pdfFileFilter = (req, file, cb) => {
  logger.debug('Validando archivo subido', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new ValidationError('Tipo de archivo no permitido. Solo se aceptan archivos PDF.', {
      errors: [{
        type: 'invalid_file_type',
        field: file.fieldname,
        message: `El archivo debe ser PDF. Tipo recibido: ${file.mimetype}`,
        allowedTypes: ALLOWED_MIME_TYPES
      }]
    });
    return cb(error, false);
  }

  // Validar extensión del archivo
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  if (fileExtension !== 'pdf') {
    const error = new ValidationError('Extensión de archivo no válida. Solo se aceptan archivos .pdf', {
      errors: [{
        type: 'invalid_file_extension',
        field: file.fieldname,
        message: `La extensión del archivo debe ser .pdf. Extensión recibida: .${fileExtension}`
      }]
    });
    return cb(error, false);
  }

  cb(null, true);
};

/**
 * Configuración de multer para subida de PDFs
 */
const uploadConfig = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Solo permitir un archivo por request
  }
});

/**
 * Middleware para subir un solo PDF
 * El campo del formulario debe llamarse 'documento'
 */
export const uploadPDF = uploadConfig.single('documento');

/**
 * Middleware para manejar errores de multer
 */
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Error de Multer', { code: err.code, message: err.message });
    
    let message = 'Error al procesar el archivo';
    let details = {};

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / 1024 / 1024}MB)`;
        details = { maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB` };
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Solo se permite subir un archivo';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Campo de archivo inesperado: ${err.field}. Use el campo 'documento'`;
        details = { expectedField: 'documento' };
        break;
      default:
        message = err.message;
    }

    return res.status(400).json({
      success: false,
      error: {
        message,
        code: err.code,
        details
      }
    });
  }

  // Si es un ValidationError de nuestro filtro
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'VALIDATION_ERROR',
        details: err.details
      }
    });
  }

  // Pasar otros errores al siguiente middleware
  next(err);
};

/**
 * Middleware para validar que el PDF esté presente (obligatorio)
 */
export const requirePDF = (req, res, next) => {
  if (!req.file) {
    logger.warn('Intento de crear solicitud sin PDF', {
      hasFile: !!req.file,
      contentType: req.get('Content-Type')
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'El documento PDF es obligatorio',
        code: 'MISSING_DOCUMENT',
        details: {
          field: 'documento',
          message: 'Debe incluir un archivo PDF en el campo "documento"'
        }
      }
    });
  }

  logger.debug('PDF recibido correctamente', {
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });

  next();
};

export default {
  uploadPDF,
  handleUploadErrors,
  requirePDF
};

