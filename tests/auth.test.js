/**
 * Tests de Autenticación
 * Tests unitarios y de integración para el módulo de autenticación
 */

import assert from 'node:assert';
import { verifyIdToken } from '../src/lib/firebase-auth.js';
import { login, register, verifyToken } from '../src/services/auth.service.js';
import { TokenExpiredError, InvalidTokenError } from '../src/lib/errors.js';
import { isValidEmail, isValidPassword, maskToken } from '../src/lib/validation.js';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    testsFailed++;
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    testsPassed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    testsFailed++;
    console.log(`❌ ${name}: ${error.message}`);
  }
}

console.log('\n🧪 Ejecutando Tests de Autenticación\n');

// Tests de Validación de Utilidades
test('Validación de email - email válido', () => {
  assert.strictEqual(isValidEmail('test@example.com'), true);
});

test('Validación de email - email inválido', () => {
  assert.strictEqual(isValidEmail('invalid-email'), false);
});

test('Validación de email - email vacío', () => {
  assert.strictEqual(isValidEmail(''), false);
});

test('Validación de contraseña - contraseña válida', () => {
  assert.strictEqual(isValidPassword('Password123'), true);
});

test('Validación de contraseña - sin mayúscula ni número', () => {
  assert.strictEqual(isValidPassword('password'), false);
});

test('Validación de contraseña - sin minúscula', () => {
  assert.strictEqual(isValidPassword('PASSWORD123'), false);
});

test('Validación de contraseña - muy corta', () => {
  assert.strictEqual(isValidPassword('Pass123'), false);
});

test('Enmascaramiento de token', () => {
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
  const masked = maskToken(token);
  assert.ok(masked.includes('...'));
  assert.ok(masked.length < token.length);
  assert.ok(masked !== token);
});

// Tests de Firebase Auth
await asyncTest('Firebase Auth - rechazar token vacío', async () => {
  try {
    await verifyIdToken('');
    assert.fail('Debería haber lanzado un error');
  } catch (error) {
    assert.ok(error instanceof InvalidTokenError || error.message.includes('token'));
  }
});

await asyncTest('Firebase Auth - rechazar token inválido', async () => {
  try {
    await verifyIdToken('token-invalido-12345');
    assert.fail('Debería haber lanzado un error');
  } catch (error) {
    assert.ok(error instanceof InvalidTokenError || error.message.includes('token'));
  }
});

// Tests de Servicio de Autenticación
await asyncTest('Servicio - rechazar login sin token', async () => {
  try {
    await login(null);
    assert.fail('Debería haber lanzado un error');
  } catch (error) {
    assert.ok(error.message.includes('requerido') || error.message.includes('required'));
  }
});

await asyncTest('Servicio - rechazar registro sin email ni token', async () => {
  try {
    await register({});
    assert.fail('Debería haber lanzado un error');
  } catch (error) {
    assert.ok(error.message.includes('requerido') || error.message.includes('required'));
  }
});

await asyncTest('Servicio - rechazar verificación sin token', async () => {
  try {
    await verifyToken(null);
    assert.fail('Debería haber lanzado un error');
  } catch (error) {
    assert.ok(error.message.includes('requerido') || error.message.includes('required'));
  }
});

// Resumen
console.log(`\n📊 Resumen:`);
console.log(`   Total: ${testsPassed + testsFailed}`);
console.log(`   ✅ Pasados: ${testsPassed}`);
console.log(`   ❌ Fallidos: ${testsFailed}\n`);

if (testsFailed > 0) {
  process.exit(1);
}

