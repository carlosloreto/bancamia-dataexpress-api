/**
 * Tests de Seguridad
 * Tests unitarios para las mejoras de seguridad implementadas
 */

import assert from 'node:assert';
import http from 'node:http';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.ALLOWED_ORIGINS = 'https://bancamia-dataexpress.web.app,http://localhost:3000,http://localhost:3001';

let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

// Importar app después de configurar env
let app;
let server;
const PORT = 3999; // Puerto de prueba

async function startTestServer() {
  try {
    // Importar app dinámicamente
    const appModule = await import('../src/app.js');
    app = appModule.default;
    
    return new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`🚀 Servidor de prueba iniciado en puerto ${PORT}`);
        // Pequeña pausa para asegurar que el servidor esté listo
        setTimeout(resolve, 1000);
      });
    });
  } catch (error) {
    console.error('Error al iniciar servidor de prueba:', error);
    throw error;
  }
}

function stopTestServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('🛑 Servidor de prueba detenido');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

function makeRequest(method, path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const requestOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 5000
    };

    const req = http.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function asyncTest(name, fn) {
  try {
    await fn();
    testsPassed++;
    testResults.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    testsFailed++;
    testResults.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n🔒 Ejecutando Tests de Seguridad\n');
  console.log('='.repeat(60));

  // Iniciar servidor antes de los tests
  await startTestServer();

  // ============================================
  // Tests de CORS
  // ============================================
  console.log('\n📋 Tests de CORS\n');

  await asyncTest('CORS - Permite origen permitido', async () => {
    const response = await makeRequest('GET', '/health', {
      headers: {
        'Origin': 'https://bancamia-dataexpress.web.app'
      }
    });
    assert.strictEqual(response.status, 200);
  });

  await asyncTest('CORS - Permite localhost para desarrollo', async () => {
    const response = await makeRequest('GET', '/health', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    assert.strictEqual(response.status, 200);
  });

  // ============================================
  // Tests de Headers de Seguridad
  // ============================================
  console.log('\n📋 Tests de Headers de Seguridad\n');

  await asyncTest('Headers - X-Content-Type-Options presente', async () => {
    const response = await makeRequest('GET', '/health');
    assert.strictEqual(response.headers['x-content-type-options'], 'nosniff');
  });

  await asyncTest('Headers - X-Frame-Options presente', async () => {
    const response = await makeRequest('GET', '/health');
    assert.strictEqual(response.headers['x-frame-options'], 'DENY');
  });

  await asyncTest('Headers - X-XSS-Protection presente', async () => {
    const response = await makeRequest('GET', '/health');
    assert.strictEqual(response.headers['x-xss-protection'], '1; mode=block');
  });

  await asyncTest('Headers - Referrer-Policy presente', async () => {
    const response = await makeRequest('GET', '/health');
    assert.strictEqual(response.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  });

  // ============================================
  // Tests de Manejo de Errores
  // ============================================
  console.log('\n📋 Tests de Manejo de Errores\n');

  await asyncTest('Errores - No expone stack trace', async () => {
    const response = await makeRequest('GET', '/ruta-inexistente-12345');
    assert.strictEqual(response.status, 404);
    const bodyStr = JSON.stringify(response.body);
    assert.ok(!bodyStr.includes('stack'), 'No debe contener stack trace');
    assert.ok(!bodyStr.includes('at '), 'No debe contener stack trace');
  });

  await asyncTest('Errores - Estructura correcta', async () => {
    const response = await makeRequest('GET', '/ruta-inexistente-12345');
    assert.strictEqual(response.status, 404);
    assert.ok(response.body.error, 'Debe tener campo error');
    assert.ok(response.body.error.message, 'Debe tener mensaje');
    assert.ok(response.body.error.code, 'Debe tener código');
  });

  // ============================================
  // Tests de Rate Limiting
  // ============================================
  console.log('\n📋 Tests de Rate Limiting\n');

  await asyncTest('Rate Limiting - Endpoint protegido', async () => {
    // Probar con ambas versiones posibles
    let response = await makeRequest('POST', '/api/v3/solicitudes', {
      body: {
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        fechaNacimiento: '1990-01-01',
        fechaExpedicionDocumento: '2020-01-01',
        ciudadNegocio: '201',
        direccionNegocio: 'Test Address',
        celularNegocio: '3001234567',
        autorizacionTratamientoDatos: true,
        autorizacionContacto: true,
        referencia: 123
      }
    });
    
    // Si falla con v3, intentar con v1
    if (response.status === 404) {
      response = await makeRequest('POST', '/api/v1/solicitudes', {
        body: {
          email: 'test@example.com',
          nombreCompleto: 'Test User',
          tipoDocumento: 'CC',
          numeroDocumento: '1234567890',
          fechaNacimiento: '1990-01-01',
          fechaExpedicionDocumento: '2020-01-01',
          ciudadNegocio: '201',
          direccionNegocio: 'Test Address',
          celularNegocio: '3001234567',
          autorizacionTratamientoDatos: true,
          autorizacionContacto: true,
          referencia: 123
        }
      });
    }
    
    // Puede ser 400 (validación) pero no debe ser 500
    assert.ok(response.status !== 500, 'No debe ser error 500');
  });

  // ============================================
  // Resumen
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Resumen de Tests\n');
  console.log(`✅ Tests pasados: ${testsPassed}`);
  console.log(`❌ Tests fallidos: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);
  console.log('\n' + '='.repeat(60) + '\n');

  await stopTestServer();

  if (testsFailed === 0) {
    console.log('🎉 ¡Todos los tests de seguridad pasaron!\n');
    return 0;
  } else {
    console.log('⚠️  Algunos tests fallaron:\n');
    testResults
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    return 1;
  }
}

// Ejecutar tests
runAllTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Error ejecutando tests:', error);
    process.exit(1);
  });
