/**
 * Script para poblar Firestore con datos iniciales
 * Ejecutar con: node src/scripts/seed-firestore.js
 */

import { config } from '../config/index.js';
import { initializeFirestore, collection, batch, FieldValue } from '../lib/firestore.js';
import { logger } from '../lib/logger.js';

// Datos de usuarios de ejemplo
const sampleUsers = [
  {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'admin'
  },
  {
    name: 'María García',
    email: 'maria.garcia@example.com',
    role: 'user'
  },
  {
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    role: 'user'
  },
  {
    name: 'Ana Rodríguez',
    email: 'ana.rodriguez@example.com',
    role: 'user'
  },
  {
    name: 'Luis Martínez',
    email: 'luis.martinez@example.com',
    role: 'user'
  }
];

/**
 * Función principal para poblar la base de datos
 */
async function seedFirestore() {
  try {
    logger.info('🌱 Iniciando proceso de seed de Firestore...');
    
    // Inicializar Firestore
    initializeFirestore();
    
    // Obtener referencia a la colección de usuarios
    const usersCollection = collection('users');
    
    // Verificar si ya hay datos
    const existingUsers = await usersCollection.limit(1).get();
    
    if (!existingUsers.empty && process.env.FORCE_SEED !== 'true') {
      logger.warn('⚠️  Ya existen usuarios en Firestore');
      logger.info('Para forzar el seed, ejecuta: FORCE_SEED=true node src/scripts/seed-firestore.js');
      process.exit(0);
    }
    
    if (!existingUsers.empty) {
      logger.info('🗑️  Eliminando usuarios existentes...');
      // Eliminar todos los usuarios existentes
      const allUsers = await usersCollection.get();
      const deleteBatch = batch();
      
      allUsers.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      
      await deleteBatch.commit();
      logger.info(`✅ ${allUsers.size} usuarios eliminados`);
    }
    
    // Crear batch para insertar usuarios
    logger.info('📝 Creando usuarios de ejemplo...');
    const writeBatch = batch();
    
    sampleUsers.forEach(userData => {
      const docRef = usersCollection.doc();
      writeBatch.set(docRef, {
        ...userData,
        createdAt: FieldValue.serverTimestamp()
      });
    });
    
    // Ejecutar batch
    await writeBatch.commit();
    
    logger.info(`✅ ${sampleUsers.length} usuarios creados exitosamente`);
    
    // Mostrar los usuarios creados
    const createdUsers = await usersCollection.get();
    console.log('\n📋 Usuarios en Firestore:');
    console.log('================================');
    createdUsers.docs.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Nombre: ${data.name}`);
      console.log(`Email: ${data.email}`);
      console.log(`Role: ${data.role}`);
      console.log('--------------------------------');
    });
    
    logger.info('🎉 Seed completado exitosamente');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Error al ejecutar seed de Firestore', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Ejecutar seed
seedFirestore();


