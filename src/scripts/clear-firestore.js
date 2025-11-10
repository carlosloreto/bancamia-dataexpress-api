/**
 * Script para limpiar todos los datos de Firestore
 * ⚠️ PRECAUCIÓN: Este script elimina TODOS los datos
 * Ejecutar con: node src/scripts/clear-firestore.js
 */

import readline from 'readline';
import { initializeFirestore, collection, batch } from '../lib/firestore.js';
import { logger } from '../lib/logger.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Solicita confirmación al usuario
 */
function askConfirmation() {
  return new Promise((resolve) => {
    rl.question('⚠️  ¿Estás seguro de que quieres eliminar TODOS los datos de Firestore? (escribe "SI" para confirmar): ', (answer) => {
      rl.close();
      resolve(answer === 'SI');
    });
  });
}

/**
 * Elimina todos los documentos de una colección
 */
async function clearCollection(collectionName) {
  try {
    const collectionRef = collection(collectionName);
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
      logger.info(`Colección "${collectionName}" ya está vacía`);
      return 0;
    }
    
    logger.info(`Eliminando ${snapshot.size} documentos de "${collectionName}"...`);
    
    // Eliminar en batches de 500 (límite de Firestore)
    const batchSize = 500;
    let deletedCount = 0;
    
    while (deletedCount < snapshot.size) {
      const deleteBatch = batch();
      const docsToDelete = snapshot.docs.slice(deletedCount, deletedCount + batchSize);
      
      docsToDelete.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      
      await deleteBatch.commit();
      deletedCount += docsToDelete.length;
      
      logger.info(`Progreso: ${deletedCount}/${snapshot.size} documentos eliminados`);
    }
    
    return deletedCount;
    
  } catch (error) {
    logger.error(`Error al limpiar colección "${collectionName}"`, {
      error: error.message
    });
    throw error;
  }
}

/**
 * Función principal
 */
async function clearFirestore() {
  try {
    logger.info('🧹 Iniciando limpieza de Firestore...');
    
    // Verificar si se está forzando sin confirmación
    if (process.env.FORCE_CLEAR !== 'true') {
      const confirmed = await askConfirmation();
      
      if (!confirmed) {
        logger.info('❌ Operación cancelada por el usuario');
        process.exit(0);
      }
    }
    
    // Inicializar Firestore
    initializeFirestore();
    
    // Lista de colecciones a limpiar
    const collections = ['users'];
    
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      const deleted = await clearCollection(collectionName);
      totalDeleted += deleted;
    }
    
    logger.info(`✅ Limpieza completada. ${totalDeleted} documentos eliminados en total`);
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Error al limpiar Firestore', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Ejecutar limpieza
clearFirestore();


