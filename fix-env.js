/**
 * Script temporal para verificar y mostrar las variables de entorno correctas
 */

import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';

// Cargar .env
dotenv.config();

console.log('\n📋 Variables de entorno actuales:\n');

const vars = {
  'FIREBASE_API_KEY': process.env.FIREBASE_API_KEY,
  'FIREBASE_AUTH_DOMAIN': process.env.FIREBASE_AUTH_DOMAIN,
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
  'FIREBASE_STORAGE_BUCKET': process.env.FIREBASE_STORAGE_BUCKET,
  'FIREBASE_MESSAGING_SENDER_ID': process.env.FIREBASE_MESSAGING_SENDER_ID,
  'FIREBASE_APP_ID': process.env.FIREBASE_APP_ID,
  'FIREBASE_MEASUREMENT_ID': process.env.FIREBASE_MEASUREMENT_ID
};

let hasErrors = false;

for (const [key, value] of Object.entries(vars)) {
  const status = value ? '✅' : '❌';
  const displayValue = value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'NO DEFINIDA';
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (!value) {
    hasErrors = true;
  }
}

// Verificar problemas específicos
console.log('\n🔍 Verificando problemas:\n');

if (process.env.FIREBASE_MESSAGING_SENDER_IDOMAIN) {
  console.log('❌ PROBLEMA: FIREBASE_MESSAGING_SENDER_IDOMAIN existe pero debería ser FIREBASE_MESSAGING_SENDER_ID');
  console.log(`   Valor encontrado: ${process.env.FIREBASE_MESSAGING_SENDER_IDOMAIN}`);
  hasErrors = true;
}

if (process.env.FIREBASE_APP_ID && process.env.FIREBASE_APP_ID.length < 40) {
  console.log('⚠️  ADVERTENCIA: FIREBASE_APP_ID parece incompleto');
  console.log(`   Longitud actual: ${process.env.FIREBASE_APP_ID.length} caracteres`);
  console.log(`   Valor: ${process.env.FIREBASE_APP_ID}`);
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('\n❌ Se encontraron problemas en las variables de entorno');
  console.log('\n📝 Formato correcto del .env debería ser:\n');
  console.log('FIREBASE_API_KEY=AIzaSyBUuImiMy_1QvZcE4Pg7t6cxjYbG1HT_5A');
  console.log('FIREBASE_AUTH_DOMAIN=bancamia-dataexpress.firebaseapp.com');
  console.log('FIREBASE_PROJECT_ID=bancamia-dataexpress');
  console.log('FIREBASE_STORAGE_BUCKET=bancamia-dataexpress.firebasestorage.app');
  console.log('FIREBASE_MESSAGING_SENDER_ID=773449658013');
  console.log('FIREBASE_APP_ID=1:773449658013:web:1e0dafc4058fba91a7ae74');
  console.log('FIREBASE_MEASUREMENT_ID=G-PK1V1T3TD2');
  console.log('NODE_ENV=production');
} else {
  console.log('\n✅ Todas las variables de entorno están correctas');
}

console.log('');

