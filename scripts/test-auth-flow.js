/**
 * Script simple para probar autenticación desde línea de comandos
 * Crea un usuario, obtiene token y hace login
 * 
 * Uso: node scripts/test-auth-flow.js usuario@example.com Password123
 */

import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_VERSION = process.env.API_VERSION || 'v1';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('📖 Uso: node scripts/test-auth-flow.js email@example.com Password123');
  console.log('\nEste script prueba el flujo completo de autenticación.');
  console.log('NOTA: Necesitas obtener un token de Firebase Auth primero.');
  console.log('      Usa el frontend o Firebase Console para crear usuario y obtener token.\n');
  process.exit(1);
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
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
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

async function testAuthFlow() {
  console.log('\n🧪 Probando Flujo de Autenticación\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🌐 API: ${API_BASE_URL}/api/${API_VERSION}\n`);

  console.log('⚠️  IMPORTANTE:');
  console.log('Para probar el flujo completo necesitas:');
  console.log('1. Crear un usuario en Firebase Console o desde el frontend');
  console.log('2. Obtener el idToken de Firebase Auth');
  console.log('3. Usar ese token en Postman o aquí\n');
  
  console.log('💡 Alternativa rápida:');
  console.log('1. Ve a Firebase Console → Authentication');
  console.log('2. Crea un usuario manualmente');
  console.log('3. Usa Postman con el token del frontend\n');
  
  console.log('📝 Para usar en Postman, ver: POSTMAN_TESTING_GUIDE.md\n');
}

testAuthFlow();

