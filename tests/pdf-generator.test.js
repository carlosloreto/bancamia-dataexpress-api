/**
 * Test Unitario - Generador de PDF
 * Prueba la generación de PDF directamente sin usar el endpoint
 * 
 * Uso: node tests/pdf-generator.test.js
 */

import { generateSolicitudPDF } from '../src/lib/pdf-generator.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

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
    return false;
  }
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

async function runTests() {
  log('\n🧪 Iniciando tests de Generación de PDF\n', 'cyan');

  // Test 1: Generar PDF con datos válidos
  let pdfBuffer = null;
  await test('Generar PDF con datos válidos', async () => {
    log(`   📄 Generando PDF...`, 'yellow');
    pdfBuffer = await generateSolicitudPDF(datosSolicitud);
    
    if (!pdfBuffer) {
      throw new Error('El PDF no se generó (buffer es null)');
    }
    
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error('El resultado no es un Buffer');
    }
    
    if (pdfBuffer.length === 0) {
      throw new Error('El PDF generado está vacío');
    }
    
    log(`   ✅ PDF generado: ${pdfBuffer.length} bytes`, 'cyan');
  });

  // Test 2: Verificar tamaño del PDF
  await test('Verificar que el PDF tenga un tamaño razonable', async () => {
    if (!pdfBuffer) {
      pdfBuffer = await generateSolicitudPDF(datosSolicitud);
    }
    
    // Un PDF básico debería tener al menos 1KB
    if (pdfBuffer.length < 1024) {
      throw new Error(`El PDF es muy pequeño: ${pdfBuffer.length} bytes (esperado al menos 1KB)`);
    }
    
    // Un PDF simple no debería ser mayor a 1MB
    if (pdfBuffer.length > 1024 * 1024) {
      throw new Error(`El PDF es muy grande: ${pdfBuffer.length} bytes (esperado menos de 1MB)`);
    }
    
    log(`   📊 Tamaño del PDF: ${(pdfBuffer.length / 1024).toFixed(2)} KB`, 'cyan');
  });

  // Test 3: Verificar que sea un PDF válido
  await test('Verificar que el buffer sea un PDF válido', async () => {
    if (!pdfBuffer) {
      pdfBuffer = await generateSolicitudPDF(datosSolicitud);
    }
    
    // Los PDFs empiezan con %PDF
    const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
    if (pdfHeader !== '%PDF') {
      throw new Error(`El archivo no es un PDF válido. Header: ${pdfHeader}`);
    }
    
    log(`   ✅ PDF válido (header: ${pdfHeader})`, 'cyan');
  });

  // Test 4: Guardar PDF en archivo para inspección manual
  await test('Guardar PDF en archivo para inspección', async () => {
    if (!pdfBuffer) {
      pdfBuffer = await generateSolicitudPDF(datosSolicitud);
    }
    
    const outputPath = join(process.cwd(), 'test-output.pdf');
    writeFileSync(outputPath, pdfBuffer);
    
    log(`   💾 PDF guardado en: ${outputPath}`, 'cyan');
    log(`   👀 Puedes abrir este archivo para verificar el contenido`, 'yellow');
  });

  // Test 5: Generar PDF con diferentes tipos de documento
  await test('Generar PDF con Cédula de Extranjería', async () => {
    const datosCE = {
      ...datosSolicitud,
      tipoDocumento: "CE",
      numeroDocumento: "CE123456"
    };
    
    const pdf = await generateSolicitudPDF(datosCE);
    
    if (!pdf || pdf.length === 0) {
      throw new Error('No se pudo generar PDF con CE');
    }
    
    log(`   ✅ PDF con CE generado: ${pdf.length} bytes`, 'cyan');
  });

  // Test 6: Generar PDF con Pasaporte
  await test('Generar PDF con Pasaporte', async () => {
    const datosPA = {
      ...datosSolicitud,
      tipoDocumento: "PA",
      numeroDocumento: "AB123456"
    };
    
    const pdf = await generateSolicitudPDF(datosPA);
    
    if (!pdf || pdf.length === 0) {
      throw new Error('No se pudo generar PDF con Pasaporte');
    }
    
    log(`   ✅ PDF con Pasaporte generado: ${pdf.length} bytes`, 'cyan');
  });

  // Test 7: Generar PDF con autorizaciones en false
  await test('Generar PDF con autorizaciones en false', async () => {
    const datosSinAuth = {
      ...datosSolicitud,
      autorizacionTratamientoDatos: false,
      autorizacionContacto: false
    };
    
    const pdf = await generateSolicitudPDF(datosSinAuth);
    
    if (!pdf || pdf.length === 0) {
      throw new Error('No se pudo generar PDF con autorizaciones en false');
    }
    
    log(`   ✅ PDF con autorizaciones false generado: ${pdf.length} bytes`, 'cyan');
  });

  // Resumen
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Resumen de Tests', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${testsPassed + testsFailed}`, 'cyan');
  log(`✅ Pasados: ${testsPassed}`, 'green');
  log(`❌ Fallidos: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log('='.repeat(60) + '\n', 'cyan');

  if (testsFailed === 0) {
    log('🎉 ¡Todos los tests pasaron exitosamente!', 'green');
    log('\n💡 El PDF de prueba se guardó en: test-output.pdf', 'yellow');
    log('   Puedes abrirlo para verificar que el contenido sea correcto.\n', 'yellow');
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


