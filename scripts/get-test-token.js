/**
 * Script para obtener token de Firebase Auth para pruebas
 * 
 * Uso: node scripts/get-test-token.js email@example.com password123
 * 
 * Requiere: Firebase Admin SDK configurado
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Firebase Admin SDK
if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    console.error('❌ Error: No se encontraron credenciales de Firebase');
    console.error('   Define FIREBASE_SERVICE_ACCOUNT o GOOGLE_APPLICATION_CREDENTIALS');
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('📖 Uso: node scripts/get-test-token.js email@example.com password123');
  console.log('\nEste script crea o obtiene un usuario y genera un token personalizado.');
  process.exit(1);
}

async function getTestToken() {
  try {
    const auth = admin.auth();
    
    let userRecord;
    
    // Intentar obtener usuario existente
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✅ Usuario encontrado: ${email}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Crear nuevo usuario
        console.log(`📝 Creando nuevo usuario: ${email}`);
        userRecord = await auth.createUser({
          email,
          password,
          emailVerified: true
        });
        console.log(`✅ Usuario creado: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Generar token personalizado (válido por 1 hora)
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    console.log('\n🔑 Token generado exitosamente\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('TOKEN PERSONALIZADO (Custom Token):');
    console.log('═══════════════════════════════════════════════════════');
    console.log(customToken);
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📝 NOTA IMPORTANTE:');
    console.log('Este es un Custom Token. Para obtener un ID Token real:');
    console.log('1. Usa este token en el frontend con signInWithCustomToken()');
    console.log('2. O mejor aún, usa el SDK del frontend para obtener el idToken\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Código:', error.code);
    }
    process.exit(1);
  }
}

getTestToken();

