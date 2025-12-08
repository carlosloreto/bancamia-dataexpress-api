/**
 * Tests de Integración - Endpoint de Solicitudes con Generación de PDF
 * Requiere servidor corriendo
 * 
 * Uso: node tests/solicitudes.test.js
 */

import http from 'http';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_VERSION = process.env.API_VERSION || 'v1';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: timeout
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    // Agregar timeout al socket
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Socket timeout after ${timeout}ms`));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test(name, fn) {
  testResults.total++;
  try {
    await fn();
    testResults.passed++;
    log(`✅ ${name}`, 'green');
    return true;
  } catch (error) {
    testResults.failed++;
    log(`❌ ${name}: ${error.message}`, 'red');
    if (error.stack) {
      log(`   ${error.stack.split('\n')[1]}`, 'yellow');
    }
    return false;
  }
}

// Datos de prueba
const solicitudValida = {
  email: `test.${Date.now()}@example.com`,
  autorizacionTratamientoDatos: true,
  autorizacionContacto: true,
  nombreCompleto: "Test Usuario",
  tipoDocumento: "CC",
  numeroDocumento: `999${Date.now().toString().slice(-7)}`,
  fechaNacimiento: "1990-01-15",
  fechaExpedicionDocumento: "2020-01-15",
  ciudadNegocio: "201",
  direccionNegocio: "Calle Test 123 #45-67",
  celularNegocio: "3001234567"
};

async function runTests() {
  log('\n🧪 Iniciando tests de Solicitudes con Generación de PDF\n', 'cyan');
  log(`📍 API URL: ${API_BASE_URL}`, 'blue');
  log(`📋 Versión: ${API_VERSION}\n`, 'blue');

  // Verificar que el servidor esté corriendo
  await test('Verificar que el servidor está corriendo', async () => {
    const response = await makeRequest('GET', '/', null, 5000);
    if (response.status !== 200) {
      throw new Error(`Servidor no responde correctamente. Status: ${response.status}`);
    }
    log(`   ✅ Servidor respondiendo en ${API_BASE_URL}`, 'cyan');
  });

  // Test 1: Crear solicitud válida
  await test('Crear solicitud con datos válidos', async () => {
    log(`   📤 Enviando solicitud...`, 'yellow');
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudValida, 60000);
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}. Response: ${JSON.stringify(response.body, null, 2)}`);
    }

    if (!response.body.success) {
      throw new Error(`Expected success: true, got ${response.body.success}`);
    }

    if (!response.body.data) {
      throw new Error('Response should contain data field');
    }

    if (!response.body.data.id) {
      throw new Error('Response should contain solicitud id');
    }

    log(`   📝 ID de solicitud: ${response.body.data.id}`, 'cyan');
    return response.body.data;
  });

  // Test 2: Verificar que el PDF se generó
  let solicitudCreada = null;
  await test('Verificar que el PDF se generó correctamente', async () => {
    log(`   📤 Enviando solicitud para verificar PDF...`, 'yellow');
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudValida, 60000);
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }

    solicitudCreada = response.body.data;

    if (!solicitudCreada.documento) {
      throw new Error('El campo "documento" no existe en la respuesta');
    }

    if (!solicitudCreada.documento.url) {
      throw new Error('El campo "documento.url" no existe');
    }

    if (!solicitudCreada.documento.path) {
      throw new Error('El campo "documento.path" no existe');
    }

    if (!solicitudCreada.documento.url.startsWith('http')) {
      throw new Error(`URL del PDF no es válida: ${solicitudCreada.documento.url}`);
    }

    log(`   📄 URL del PDF: ${solicitudCreada.documento.url}`, 'cyan');
    log(`   📁 Path: ${solicitudCreada.documento.path}`, 'cyan');
  });

  // Test 3: Verificar estructura del documento
  await test('Verificar estructura completa del documento', async () => {
    if (!solicitudCreada) {
      const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudValida, 60000);
      solicitudCreada = response.body.data;
    }

    const documento = solicitudCreada.documento;
    const camposRequeridos = ['url', 'path', 'fileName', 'originalName'];

    for (const campo of camposRequeridos) {
      if (!documento[campo]) {
        throw new Error(`Campo requerido "${campo}" no existe en documento`);
      }
    }

    if (!documento.fileName.endsWith('.pdf')) {
      throw new Error(`El nombre del archivo debe terminar en .pdf: ${documento.fileName}`);
    }
  });

  // Test 4: Validación - Email inválido
  await test('Rechazar solicitud con email inválido', async () => {
    const solicitudInvalida = { ...solicitudValida, email: 'email-invalido' };
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudInvalida, 30000);
    
    if (response.status !== 400) {
      throw new Error(`Expected status 400 for invalid email, got ${response.status}`);
    }

    if (response.body.success !== false) {
      throw new Error('Response should indicate failure');
    }
  });

  // Test 5: Validación - Campos faltantes
  await test('Rechazar solicitud con campos faltantes', async () => {
    const solicitudIncompleta = {
      email: solicitudValida.email,
      nombreCompleto: solicitudValida.nombreCompleto
      // Faltan otros campos requeridos
    };
    
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudIncompleta, 30000);
    
    if (response.status !== 400) {
      throw new Error(`Expected status 400 for missing fields, got ${response.status}`);
    }
  });

  // Test 6: Validación - Tipo de documento inválido
  await test('Rechazar solicitud con tipo de documento inválido', async () => {
    const solicitudInvalida = { ...solicitudValida, tipoDocumento: 'INVALIDO' };
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudInvalida, 30000);
    
    if (response.status !== 400) {
      throw new Error(`Expected status 400 for invalid document type, got ${response.status}`);
    }
  });

  // Test 7: Validación - Fecha de nacimiento futura
  await test('Rechazar solicitud con fecha de nacimiento futura', async () => {
    const solicitudInvalida = { 
      ...solicitudValida, 
      fechaNacimiento: '2030-01-15' // Fecha futura
    };
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudInvalida, 30000);
    
    if (response.status !== 400) {
      throw new Error(`Expected status 400 for future birth date, got ${response.status}`);
    }
  });

  // Test 8: Validación - Menor de 18 años
  await test('Rechazar solicitud de menor de 18 años', async () => {
    const fechaHace17Anios = new Date();
    fechaHace17Anios.setFullYear(fechaHace17Anios.getFullYear() - 17);
    const fechaString = fechaHace17Anios.toISOString().split('T')[0];
    
    const solicitudInvalida = { 
      ...solicitudValida, 
      fechaNacimiento: fechaString
    };
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudInvalida, 30000);
    
    if (response.status !== 400) {
      throw new Error(`Expected status 400 for underage, got ${response.status}`);
    }
  });

  // Test 9: Verificar que los datos se guardaron correctamente
  await test('Verificar que todos los datos se guardaron en la respuesta', async () => {
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudValida, 60000);
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }

    const data = response.body.data;
    const camposEsperados = [
      'email', 'nombreCompleto', 'tipoDocumento', 'numeroDocumento',
      'fechaNacimiento', 'fechaExpedicionDocumento', 'ciudadNegocio',
      'direccionNegocio', 'celularNegocio', 'autorizacionTratamientoDatos',
      'autorizacionContacto', 'estado', 'documento'
    ];

    for (const campo of camposEsperados) {
      if (!(campo in data)) {
        throw new Error(`Campo requerido "${campo}" no existe en la respuesta`);
      }
    }

    // Verificar que los valores coinciden
    if (data.email !== solicitudValida.email) {
      throw new Error(`Email no coincide: esperado ${solicitudValida.email}, obtenido ${data.email}`);
    }

    if (data.nombreCompleto !== solicitudValida.nombreCompleto) {
      throw new Error(`Nombre no coincide`);
    }
  });

  // Test 10: Verificar estado inicial
  await test('Verificar que el estado inicial es "pendiente"', async () => {
    const response = await makeRequest('POST', `/api/${API_VERSION}/solicitudes`, solicitudValida, 60000);
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }

    if (response.body.data.estado !== 'pendiente') {
      throw new Error(`Expected estado "pendiente", got "${response.body.data.estado}"`);
    }
  });

  // Resumen
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Resumen de Tests', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${testResults.total}`, 'blue');
  log(`✅ Pasados: ${testResults.passed}`, 'green');
  log(`❌ Fallidos: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log('='.repeat(60) + '\n', 'cyan');

  if (testResults.failed === 0) {
    log('🎉 ¡Todos los tests pasaron exitosamente!', 'green');
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

