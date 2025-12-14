/**
 * Generador de PDF para solicitudes de crédito
 * Crea un PDF con los datos de la solicitud
 */

import PDFDocument from 'pdfkit';
import { logger } from './logger.js';

/**
 * Genera un PDF con los datos de la solicitud de crédito
 * @param {Object} solicitudData - Datos de la solicitud
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export const generateSolicitudPDF = async (solicitudData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const buffers = [];
      
      // Acumular chunks del PDF
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (error) => {
        logger.error('Error al generar PDF', { error: error.message });
        reject(error);
      });

      // ============================================
      // ENCABEZADO
      // ============================================
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('SOLICITUD DE CRÉDITO', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Bancamia DataExpress', { align: 'center' })
         .moveDown(1);

      // Línea separadora
      doc.strokeColor('#cccccc')
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(1);

      // ============================================
      // INFORMACIÓN PERSONAL
      // ============================================
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('INFORMACIÓN PERSONAL', { underline: true })
         .moveDown(0.5);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333');

      // Nombre completo
      doc.text(`Nombre Completo: ${solicitudData.nombreCompleto || 'N/A'}`, {
        continued: false
      })
      .moveDown(0.3);

      // Tipo y número de documento
      const tipoDocMap = {
        'CC': 'Cédula de Ciudadanía',
        'CE': 'Cédula de Extranjería',
        'PA': 'Pasaporte',
        'PEP': 'Permiso Especial de Permanencia',
        'PPP': 'Permiso por Protección Temporal'
      };
      const tipoDocTexto = tipoDocMap[solicitudData.tipoDocumento] || solicitudData.tipoDocumento || 'N/A';
      
      doc.text(`Tipo de Documento: ${tipoDocTexto}`, {
        continued: true
      })
      .text(`Número: ${solicitudData.numeroDocumento || 'N/A'}`, {
        align: 'right'
      })
      .moveDown(0.3);

      // Fechas
      doc.text(`Fecha de Nacimiento: ${solicitudData.fechaNacimiento || 'N/A'}`, {
        continued: true
      })
      .text(`Expedición Documento: ${solicitudData.fechaExpedicionDocumento || 'N/A'}`, {
        align: 'right'
      })
      .moveDown(0.3);

      // Email
      doc.text(`Email: ${solicitudData.email || 'N/A'}`)
         .moveDown(0.3);

      // Referencia
      doc.text(`Referencia: ${solicitudData.referencia !== undefined && solicitudData.referencia !== null ? solicitudData.referencia : 'N/A'}`)
         .moveDown(1);

      // ============================================
      // INFORMACIÓN DEL NEGOCIO
      // ============================================
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('INFORMACIÓN DEL NEGOCIO', { underline: true })
         .moveDown(0.5);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333');

      // Ciudad
      doc.text(`Ciudad: ${solicitudData.ciudadNegocio || 'N/A'}`)
         .moveDown(0.3);

      // Dirección
      doc.text(`Dirección: ${solicitudData.direccionNegocio || 'N/A'}`)
         .moveDown(0.3);

      // Celular
      doc.text(`Celular: ${solicitudData.celularNegocio || 'N/A'}`)
         .moveDown(1);

      // ============================================
      // AUTORIZACIONES
      // ============================================
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('AUTORIZACIONES', { underline: true })
         .moveDown(0.5);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333');

      const autorizacionTratamiento = solicitudData.autorizacionTratamientoDatos === true || 
                                       solicitudData.autorizacionTratamientoDatos === 'true' ? 'Sí' : 'No';
      const autorizacionContacto = solicitudData.autorizacionContacto === true || 
                                   solicitudData.autorizacionContacto === 'true' ? 'Sí' : 'No';

      doc.text(`✓ Autorización Tratamiento de Datos: ${autorizacionTratamiento}`)
         .moveDown(0.3);
      doc.text(`✓ Autorización de Contacto: ${autorizacionContacto}`)
         .moveDown(1);

      // ============================================
      // PIE DE PÁGINA
      // ============================================
      const pageHeight = doc.page.height;
      const pageWidth = doc.page.width;
      const footerY = pageHeight - 50;

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#999999')
         .text(
           `Generado el ${new Date().toLocaleString('es-CO', { 
             dateStyle: 'long', 
             timeStyle: 'short' 
           })}`,
           50,
           footerY,
           { align: 'center', width: pageWidth - 100 }
         );

      // Finalizar el documento
      doc.end();

    } catch (error) {
      logger.error('Error al crear PDF', { error: error.message, stack: error.stack });
      reject(error);
    }
  });
};

