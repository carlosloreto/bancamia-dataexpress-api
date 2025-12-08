/**
 * Test de Generación y Subida de PDF a Firebase Storage
 * Prueba la generación del PDF Y la subida a Firebase Storage
 * 
 * Uso: node tests/pdf-storage.test.js
 * 
 * Requisitos:
 * - Variables de entorno de Firebase configuradas en .env
 * - Firebase Storage habilitado
 */

// IMPORTANTE: Cargar dotenv ANTES de cualquier import que use process.env
import dotenv from 'dotenv';
dotenv.config();

// Verificar que las variables estén cargadas
if (!process.env.FIREBASE_STORAGE_BUCKET) {
  console.error('❌ FIREBASE_STORAGE_BUCKET no está configurado en .env');
  console.error('   Verifica que el archivo .env tenga: FIREBASE_STORAGE_BUCKET=bancamia-dataexpress.firebasestorage.app');
  process.exit(1);
}

// Ahora sí importar los módulos que usan variables de entorno
import { generateSolicitudPDF } from '../src/lib/pdf-generator.js';
import { uploadPDF, initializeStorage } from '../src/lib/storage.js';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    await fn();
    testsPassed++;
    log(`✅ ${name}`, 'green');
    return true;
  } catch (error) {
    testsFailed++;
    log(`❌ ${name}: ${error.message}`, 'red');
    if (error.stack) {
      log(`   ${error.stack.split('\n')[1]}`, 'yellow');
    }
    return false;
  }
}

// Datos de prueba
const datosSolicitud = {
  email: `test.${Date.now()}@example.com`,
  autorizacionTratamientoDatos: true,
  autorizacionContacto: true,
  nombreCompleto: "Test Usuario PDF Storage",
  tipoDocumento: "CC",
  numeroDocumento: `999${Date.now().toString().slice(-7)}`,
  fechaNacimiento: "1990-01-15",
  fechaExpedicionDocumento: "2020-01-15",
  ciudadNegocio: "201",
  direccionNegocio: "Calle Test 123 #45-67",
  celularNegocio: "3001234567"
};

async function runTests() {
  log('\n🧪 Iniciando tests de Generación y Subida de PDF a Storage\n', 'cyan');

  // Inicializar Firebase Storage
  await test('Inicializar Firebase Storage', async () => {
    try {
      initializeStorage();
      log(`   ✅ Firebase Storage inicializado`, 'cyan');
    } catch (error) {
      throw new Error(`Error al inicializar Storage: ${error.message}`);
    }
  });

  // Test 1: Generar PDF
  let pdfBuffer = null;
  await test('Generar PDF con datos válidos', async () => {
    log(`   📄 Generando PDF...`, 'yellow');
    pdfBuffer = await generateSolicitudPDF(datosSolicitud);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('El PDF no se generó o está vacío');
    }
    
    log(`   ✅ PDF generado: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`, 'cyan');
  });

  // Test 2: Subir PDF a Firebase Storage
  let documentoInfo = null;
  await test('Subir PDF a Firebase Storage', async () => {
    if (!pdfBuffer) {
      pdfBuffer = await generateSolicitudPDF(datosSolicitud);
    }
    
    const solicitudId = `test_${Date.now()}_${datosSolicitud.numeroDocumento}`;
    const fileName = `solicitud_${datosSolicitud.numeroDocumento}_${Date.now()}.pdf`;
    
    log(`   📤 Subiendo PDF a Storage...`, 'yellow');
    log(`   📁 Nombre: ${fileName}`, 'cyan');
    log(`   📂 Path: solicitudes/${solicitudId}/`, 'cyan');
    
    documentoInfo = await uploadPDF(
      pdfBuffer,
      fileName,
      solicitudId
    );
    
    if (!documentoInfo) {
      throw new Error('No se recibió información del documento');
    }
    
    if (!documentoInfo.url) {
      throw new Error('No se recibió URL del documento');
    }
    
    if (!documentoInfo.path) {
      throw new Error('No se recibió path del documento');
    }
    
    log(`   ✅ PDF subido exitosamente`, 'cyan');
    log(`   🔗 URL: ${documentoInfo.url}`, 'cyan');
    log(`   📁 Path: ${documentoInfo.path}`, 'cyan');
  });

  // Test 3: Verificar que la URL sea accesible
  await test('Verificar que la URL del PDF sea válida', async () => {
    if (!documentoInfo) {
      throw new Error('No hay información del documento para verificar');
    }
    
    if (!documentoInfo.url.startsWith('http')) {
      throw new Error(`URL no es válida: ${documentoInfo.url}`);
    }
    
    if (!documentoInfo.url.includes('firebasestorage.googleapis.com')) {
      throw new Error(`URL no es de Firebase Storage: ${documentoInfo.url}`);
    }
    
    log(`   ✅ URL válida de Firebase Storage`, 'cyan');
  });

  // Test 4: Verificar estructura completa del documento
  await test('Verificar estructura completa del documento', async () => {
    if (!documentoInfo) {
      throw new Error('No hay información del documento');
    }
    
    const camposRequeridos = ['url', 'path', 'fileName', 'originalName'];
    
    for (const campo of camposRequeridos) {
      if (!documentoInfo[campo]) {
        throw new Error(`Campo requerido "${campo}" no existe`);
      }
    }
    
    if (!documentoInfo.fileName.endsWith('.pdf')) {
      throw new Error(`El nombre del archivo debe terminar en .pdf: ${documentoInfo.fileName}`);
    }
    
    log(`   ✅ Estructura completa: ${camposRequeridos.join(', ')}`, 'cyan');
  });

  // Resumen
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Resumen de Tests', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${testsPassed + testsFailed}`, 'cyan');
  log(`✅ Pasados: ${testsPassed}`, 'green');
  log(`❌ Fallidos: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'cyan');
  
  if (documentoInfo) {
    log('\n📄 Información del PDF subido:', 'cyan');
    log(`   URL: ${documentoInfo.url}`, 'yellow');
    log(`   Path: ${documentoInfo.path}`, 'yellow');
    log(`   FileName: ${documentoInfo.fileName}`, 'yellow');
    log(`\n💡 Puedes abrir la URL en tu navegador para verificar el PDF\n`, 'yellow');
  }

  if (testsFailed === 0) {
    log('🎉 ¡Todos los tests pasaron exitosamente!', 'green');
    log('✅ El PDF se generó y se subió correctamente a Firebase Storage\n', 'green');
    process.exit(0);
  } else {
    log('⚠️  Algunos tests fallaron. Revisa los errores arriba.', 'yellow');
    process.exit(1);
  }
}

// Ejecutar tests
runTests().catch((error) => {
  log(`\n💥 Error fatal ejecutando tests: ${error.message}`, 'red');
  if (error.stack) {
    log(error.stack, 'yellow');
  }
  process.exit(1);
});

