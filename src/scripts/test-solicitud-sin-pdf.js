/**
 * Script para probar crear una solicitud SIN PDF
 * Esto nos ayudará a ver qué pasa cuando documento es null
 * 
 * Uso: node src/scripts/test-solicitud-sin-pdf.js
 */

import { createSolicitud } from '../services/solicitudes.service.js';
import { initializeFirestore } from '../lib/firestore-client.js';
import { logger } from '../lib/logger.js';

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

// Datos de prueba SIN documento
// IMPORTANTE: NO incluimos el campo 'documento' en absoluto
const solicitudDataSinPDF = {
  email: `test.sinpdf.${Date.now()}@example.com`,
  autorizacionTratamientoDatos: true,
  autorizacionContacto: true,
  nombreCompleto: "Test Usuario Sin PDF",
  tipoDocumento: "CC",
  numeroDocumento: `999${Date.now().toString().slice(-7)}`,
  fechaNacimiento: "1990-01-15",
  fechaExpedicionDocumento: "2020-01-15",
  ciudadNegocio: "201",
  direccionNegocio: "Calle Test Sin PDF 123",
  celularNegocio: "3001234567"
  // NO incluimos 'documento' - será undefined
};

async function testSolicitudSinPDF() {
  try {
    log('\n🧪 TEST: Crear Solicitud SIN PDF\n', 'cyan');
    
    // Inicializar Firestore
    log('📡 Inicializando Firestore...', 'yellow');
    initializeFirestore();
    log('   ✅ Firestore inicializado', 'green');
    
    // Mostrar datos que vamos a enviar
    log('\n📋 Datos de la solicitud (SIN documento):', 'cyan');
    console.log(JSON.stringify(solicitudDataSinPDF, null, 2));
    
    // Mostrar qué se va a enviar al servicio
    log('\n🔍 Datos que se enviarán al servicio:', 'cyan');
    log(`   - documento presente: ${solicitudDataSinPDF.documento !== undefined}`, 'cyan');
    log(`   - documento valor: ${solicitudDataSinPDF.documento === undefined ? 'undefined' : solicitudDataSinPDF.documento === null ? 'null' : JSON.stringify(solicitudDataSinPDF.documento)}`, 'cyan');
    
    // Intentar crear la solicitud
    log('\n💾 Intentando crear solicitud en Firestore...', 'yellow');
    
    try {
      const nuevaSolicitud = await createSolicitud(solicitudDataSinPDF);
      
      log('\n✅ Solicitud creada exitosamente!', 'green');
      log('\n📊 RESULTADO:', 'cyan');
      log('┌─────────────────────────────────────────────────┐', 'cyan');
      log(`│ ID: ${nuevaSolicitud.id}`, 'cyan');
      log(`│ Email: ${nuevaSolicitud.email}`, 'cyan');
      log(`│ Nombre: ${nuevaSolicitud.nombreCompleto}`, 'cyan');
      log(`│ Documento: ${nuevaSolicitud.documento === null ? 'null' : JSON.stringify(nuevaSolicitud.documento)}`, 'cyan');
      log('└─────────────────────────────────────────────────┘', 'cyan');
      
      log('\n📝 Solicitud completa guardada:', 'blue');
      console.log(JSON.stringify(nuevaSolicitud, null, 2));
      
      // Verificar específicamente el campo documento
      log('\n🔍 Análisis del campo "documento":', 'yellow');
      if (nuevaSolicitud.documento === null) {
        log('   ✅ Campo "documento" está presente y es null', 'green');
        log('   📌 Esto significa que Firestore guardó el campo como null', 'cyan');
      } else if (nuevaSolicitud.documento === undefined) {
        log('   ⚠️  Campo "documento" NO está presente (undefined)', 'yellow');
        log('   📌 Esto significa que Firestore NO guardó el campo', 'cyan');
      } else if (typeof nuevaSolicitud.documento === 'object') {
        log('   ✅ Campo "documento" está presente como objeto', 'green');
        log(`   📌 Contenido: ${JSON.stringify(nuevaSolicitud.documento)}`, 'cyan');
      } else {
        log(`   ⚠️  Campo "documento" tiene un tipo inesperado: ${typeof nuevaSolicitud.documento}`, 'yellow');
      }
      
      log('\n✅ Test completado exitosamente!', 'green');
      log('   Puedes verificar en Firebase Console que el registro se guardó correctamente.\n', 'cyan');
      
      process.exit(0);
      
    } catch (error) {
      log(`\n❌ Error al crear solicitud: ${error.message}`, 'red');
      
      if (error.stack) {
        log(`\n📋 Stack trace:`, 'yellow');
        log(error.stack, 'red');
      }
      
      // Verificar si es el error esperado de validación
      if (error.message && error.message.includes('URL válida')) {
        log('\n✅ Esto es el comportamiento esperado:', 'green');
        log('   El sistema detectó que el documento no tiene URL válida', 'cyan');
        log('   y lanzó un error para prevenir guardar sin PDF.', 'cyan');
      } else if (error.message && error.message.includes('documento')) {
        log('\n✅ Esto es el comportamiento esperado:', 'green');
        log('   El sistema detectó un problema con el documento', 'cyan');
        log('   y lanzó un error para prevenir guardar sin PDF.', 'cyan');
      } else {
        log('\n⚠️  Error inesperado:', 'yellow');
        log('   Este error no estaba previsto en el código.', 'yellow');
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Error fatal en el test: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

// Ejecutar test
testSolicitudSinPDF();

