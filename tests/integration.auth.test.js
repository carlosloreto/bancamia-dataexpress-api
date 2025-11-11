/**
 * Tests de Integración - Endpoints de Autenticación
 * Requiere servidor corriendo y Firebase configurado
 * 
 * Uso: node tests/integration.auth.test.js
 */

import http from 'http';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_VERSION = process.env.API_VERSION || 'v1';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}/api/${API_VERSION}${path}`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const req = http.request(url, options, (res) => {
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
  } catch (error) {
    testResults.failed++;
    log(`❌ ${name}: ${error.message}`, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

async function runTests() {
  log('\n🧪 Iniciando Tests de Integración - Autenticación\n', 'blue');

  // Test 1: Health check
  await test('Health check responde correctamente', async () => {
    const response = await makeRequest('GET', '/health');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
  });

  // Test 2: Login sin token
  await test('Login sin token debe retornar error', async () => {
    const response = await makeRequest('POST', '/auth/login', {});
    if (response.status === 200) {
      throw new Error('Expected error, got success');
    }
    if (!response.body.error) {
      throw new Error('Expected error object in response');
    }
  });

  // Test 3: Login con token inválido
  await test('Login con token inválido debe retornar error', async () => {
    const response = await makeRequest('POST', '/auth/login', {
      idToken: 'token-invalido-12345'
    });
    if (response.status === 200) {
      throw new Error('Expected error, got success');
    }
  });

  // Test 4: Verificar endpoint sin token
  await test('Verificar token sin token debe retornar error', async () => {
    const response = await makeRequest('POST', '/auth/verify', {});
    if (response.status === 200) {
      throw new Error('Expected error, got success');
    }
  });

  // Test 5: Obtener perfil sin autenticación
  await test('GET /auth/me sin token debe retornar 401', async () => {
    const response = await makeRequest('GET', '/auth/me');
    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });

  // Test 6: Obtener usuarios sin autenticación
  await test('GET /users sin token debe retornar 401', async () => {
    const response = await makeRequest('GET', '/users');
    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });

  // Test 7: Crear solicitud sin autenticación
  await test('POST /solicitudes sin token debe retornar 401', async () => {
    const response = await makeRequest('POST', '/solicitudes', {
      nombreCompleto: 'Test User'
    });
    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });

  // Resumen
  log('\n📊 Resumen de Tests\n', 'blue');
  log(`Total: ${testResults.total}`, 'blue');
  log(`Pasados: ${testResults.passed}`, 'green');
  log(`Fallidos: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  if (testResults.failed > 0) {
    process.exit(1);
  }
}

// Ejecutar tests
runTests().catch((error) => {
  log(`\n❌ Error ejecutando tests: ${error.message}`, 'red');
  process.exit(1);
});

