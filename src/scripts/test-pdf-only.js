/**
 * Script para probar SOLO la generación y subida del PDF
 * Sin crear un registro en Firestore
 * 
 * Uso: node src/scripts/test-pdf-only.js
 */

import { generateSolicitudPDF } from '../lib/pdf-generator.js';
import { uploadPDF, initializeStorage } from '../lib/storage.js';
import { logger } from '../lib/logger.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Datos de prueba
const datosSolicitud = {
  email: "test@example.com",
  autorizacionTratamientoDatos: true,
  autorizacionContacto: true,
  nombreCompleto: "Juan Pérez García",
  tipoDocumento: "CC",
  numeroDocumento: "1234567890",
  fechaNacimiento: "1990-01-15",
  fechaExpedicionDocumento: "2020-01-15",
  ciudadNegocio: "201",
  direccionNegocio: "Calle 123 #45-67, Barrio Centro",
  celularNegocio: "3001234567"
};

async function testPDFOnly() {
  try {
    log('\n🧪 TEST: Generación y Subida de PDF (SIN crear registro)\n', 'cyan');
    
    // Paso 1: Generar PDF
    log('📄 Paso 1: Generando PDF...', 'yellow');
    let pdfBuffer;
    
    try {
      pdfBuffer = await generateSolicitudPDF(datosSolicitud);
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('El PDF generado está vacío');
      }
      
      if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error('El resultado no es un Buffer');
      }
      
      log(`   ✅ PDF generado exitosamente`, 'green');
      log(`   📊 Tamaño: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`, 'cyan');
      
      // Verificar que sea un PDF válido
      const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
      if (pdfHeader !== '%PDF') {
        throw new Error(`El archivo no es un PDF válido. Header: ${pdfHeader}`);
      }
      log(`   ✅ PDF válido (header: ${pdfHeader})`, 'green');
      
    } catch (error) {
      log(`   ❌ Error al generar PDF: ${error.message}`, 'red');
      throw error;
    }
    
    // Guardar PDF localmente para inspección
    const localPath = join(process.cwd(), 'test-pdf-only.pdf');
    writeFileSync(localPath, pdfBuffer);
    log(`   💾 PDF guardado localmente en: ${localPath}`, 'blue');
    
    // Paso 2: Subir a Firebase Storage
    log('\n☁️  Paso 2: Subiendo PDF a Firebase Storage...', 'yellow');
    let documentoInfo;
    
    try {
      // Inicializar Storage
      initializeStorage();
      log('   ✅ Firebase Storage inicializado', 'green');
      
      // Generar ID temporal
      const tempId = `${Date.now()}_${datosSolicitud.numeroDocumento}`;
      const fileName = `solicitud_${datosSolicitud.numeroDocumento}_${Date.now()}.pdf`;
      
      log(`   📤 Subiendo archivo: ${fileName}`, 'cyan');
      log(`   📁 Path temporal: solicitudes/${tempId}/`, 'cyan');
      
      documentoInfo = await uploadPDF(pdfBuffer, fileName, tempId);
      
      if (!documentoInfo || !documentoInfo.url) {
        throw new Error('No se pudo obtener la URL del PDF subido');
      }
      
      log(`   ✅ PDF subido exitosamente a Firebase Storage`, 'green');
      log(`\n   📋 INFORMACIÓN DEL DOCUMENTO:`, 'cyan');
      log(`   ┌─────────────────────────────────────────────────┐`, 'cyan');
      log(`   │ URL: ${documentoInfo.url}`, 'cyan');
      log(`   │ Path: ${documentoInfo.path}`, 'cyan');
      log(`   │ FileName: ${documentoInfo.fileName}`, 'cyan');
      log(`   │ OriginalName: ${documentoInfo.originalName}`, 'cyan');
      log(`   └─────────────────────────────────────────────────┘`, 'cyan');
      
    } catch (error) {
      log(`   ❌ Error al subir PDF: ${error.message}`, 'red');
      if (error.stack) {
        log(`   Stack: ${error.stack}`, 'red');
      }
      throw error;
    }
    
    // Paso 3: Mostrar resumen
    log('\n✅ RESUMEN DEL TEST:', 'green');
    log(`   ✓ PDF generado: ${pdfBuffer.length} bytes`, 'green');
    log(`   ✓ PDF subido a Storage: ${documentoInfo.url}`, 'green');
    log(`   ✓ Documento info completo:`, 'green');
    log(`     - URL: ${documentoInfo.url ? '✅' : '❌'}`, documentoInfo.url ? 'green' : 'red');
    log(`     - Path: ${documentoInfo.path ? '✅' : '❌'}`, documentoInfo.path ? 'green' : 'red');
    log(`     - FileName: ${documentoInfo.fileName ? '✅' : '❌'}`, documentoInfo.fileName ? 'green' : 'red');
    log(`     - OriginalName: ${documentoInfo.originalName ? '✅' : '❌'}`, documentoInfo.originalName ? 'green' : 'red');
    
    log('\n📝 Este es el objeto que se debería guardar en Firestore:', 'blue');
    console.log(JSON.stringify(documentoInfo, null, 2));
    
    log('\n✅ Test completado exitosamente!', 'green');
    log('   Puedes usar esta información para verificar que el PDF se guarde correctamente.\n', 'cyan');
    
    process.exit(0);
    
  } catch (error) {
    log(`\n❌ Error en el test: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

// Ejecutar test
testPDFOnly();

