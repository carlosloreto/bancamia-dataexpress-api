/**
 * Script para verificar una solicitud específica en la API
 * Para ver si el documento está guardado en Firestore
 */

const API_URL = 'https://bancamia-dataexpress-api-773449658013.southamerica-east1.run.app';

// ID de la última solicitud creada
const solicitudId = 'F6P0EUJPnonwNJqua3Wz'; // Del último test

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verificarSolicitud() {
  try {
    log('\n🔍 Verificando solicitud en Firestore...\n', 'cyan');
    log(`📍 Solicitud ID: ${solicitudId}`, 'blue');
    
    // Intentar obtener la solicitud
    log('📤 Obteniendo solicitud de la API...', 'yellow');
    
    const response = await fetch(`${API_URL}/api/v1/solicitudes/${solicitudId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      log(`\n❌ Error: ${response.status} ${response.statusText}`, 'red');
      const errorData = await response.json();
      console.log(JSON.stringify(errorData, null, 2));
      process.exit(1);
    }
    
    const responseData = await response.json();
    
    log('\n📥 Respuesta del servidor:', 'cyan');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (responseData.data) {
      log('\n🔍 Análisis del campo "documento":', 'yellow');
      
      if (responseData.data.documento) {
        log('   ✅ Campo "documento" ESTÁ presente en Firestore', 'green');
        log(`   📌 Tipo: ${typeof responseData.data.documento}`, 'cyan');
        
        if (typeof responseData.data.documento === 'object') {
          log('   📋 Contenido del documento:', 'cyan');
          console.log(JSON.stringify(responseData.data.documento, null, 2));
          
          if (responseData.data.documento.url) {
            log('   ✅ URL presente', 'green');
            log(`   🔗 ${responseData.data.documento.url}`, 'blue');
          } else {
            log('   ❌ URL NO presente', 'red');
          }
        } else if (responseData.data.documento === null) {
          log('   ⚠️  Campo "documento" es null', 'yellow');
        }
      } else {
        log('   ❌ Campo "documento" NO está presente en Firestore', 'red');
        log('   📌 Esto confirma que el documento NO se guardó', 'yellow');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

verificarSolicitud();

