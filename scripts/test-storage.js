/**
 * Script para probar la conexión a Firebase Storage
 */

import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

console.log('📋 Configuración de Firebase:');
console.log('  - Project ID:', firebaseConfig.projectId);
console.log('  - Storage Bucket:', firebaseConfig.storageBucket);
console.log('  - Auth Domain:', firebaseConfig.authDomain);
console.log('');

async function testStorage() {
  try {
    console.log('🔄 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    console.log('✅ Firebase inicializado');

    // Leer el PDF de prueba
    const pdfPath = join(__dirname, '..', 'solicitud-prueba.pdf');
    console.log('📄 Leyendo PDF desde:', pdfPath);
    
    const fileBuffer = readFileSync(pdfPath);
    console.log('✅ PDF leído, tamaño:', fileBuffer.length, 'bytes');

    // Subir a Storage
    const storagePath = `test/${Date.now()}_test.pdf`;
    console.log('📤 Subiendo a:', storagePath);
    
    const fileRef = ref(storage, storagePath);
    const metadata = {
      contentType: 'application/pdf'
    };

    const uploadResult = await uploadBytes(fileRef, fileBuffer, metadata);
    console.log('✅ Archivo subido:', uploadResult.metadata.fullPath);

    // Obtener URL
    const downloadURL = await getDownloadURL(fileRef);
    console.log('🔗 URL de descarga:', downloadURL);

    console.log('\n✅ ¡Test completado exitosamente!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Código:', error.code);
    console.error('Stack:', error.stack);
  }
}

testStorage();

