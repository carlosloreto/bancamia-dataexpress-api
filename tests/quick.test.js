/**
 * Script de Testing Rápido
 * Ejecuta tests básicos de autenticación
 * 
 * Uso: node tests/quick.test.js [TOKEN_OPCIONAL]
 */

import { isValidEmail, isValidPassword, maskToken } from '../src/lib/validation.js';

const token = process.argv[2];

console.log('\n🧪 Tests Rápidos de Autenticación\n');

// Test 1: Validación de email
console.log('Test 1: Validación de email');
const emails = [
  { email: 'test@example.com', expected: true },
  { email: 'invalid-email', expected: false },
  { email: '', expected: false },
  { email: 'user@domain.co', expected: true }
];

emails.forEach(({ email, expected }) => {
  const result = isValidEmail(email);
  const status = result === expected ? '✅' : '❌';
  console.log(`  ${status} isValidEmail("${email}") = ${result} (esperado: ${expected})`);
});

// Test 2: Validación de contraseña
console.log('\nTest 2: Validación de contraseña');
const passwords = [
  { password: 'Password123', expected: true },
  { password: 'password', expected: false },
  { password: 'PASSWORD123', expected: false },
  { password: 'Pass123', expected: false },
  { password: '', expected: false }
];

passwords.forEach(({ password, expected }) => {
  const result = isValidPassword(password);
  const status = result === expected ? '✅' : '❌';
  console.log(`  ${status} isValidPassword("${password}") = ${result} (esperado: ${expected})`);
});

// Test 3: Enmascaramiento de token
console.log('\nTest 3: Enmascaramiento de token');
if (token) {
  const masked = maskToken(token);
  console.log(`  ✅ Token original: ${token.substring(0, 20)}...`);
  console.log(`  ✅ Token enmascarado: ${masked}`);
} else {
  const testToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
  const masked = maskToken(testToken);
  console.log(`  ✅ Token de prueba enmascarado: ${masked}`);
  console.log(`  💡 Para probar con tu token: node tests/quick.test.js TU_TOKEN`);
}

console.log('\n✅ Tests rápidos completados\n');

