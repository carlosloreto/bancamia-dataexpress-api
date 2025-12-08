/**
 * Script para probar crear una solicitud CON PDF a través de la API desplegada
 * Para comparar con el test sin PDF
 * 
 * Uso: node test-api-con-pdf.js
 */

const API_URL = 'https://bancamia-dataexpress-api-773449658013.southamerica-east1.run.app';

// Colores para output
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

// Datos de prueba (el servidor generará el PDF automáticamente)
const solicitudData = {
  email: `test.conpdf.${Date.now()}@example.com`,
  autorizacionTratamientoDatos: true,
  autorizacionContacto: true,
  nombreCompleto: "Test Usuario Con PDF API",
  tipoDocumento: "CC",
  numeroDocumento: `888${Date.now().toString().slice(-7)}`,
  fechaNacimiento: "1990-01-15",
  fechaExpedicionDocumento: "2020-01-15",
  ciudadNegocio: "201",
  direccionNegocio: "Calle Test Con PDF API 123",
  celularNegocio: "3001234567"
};

async function testAPIConPDF() {
  try {
    log('\n🧪 TEST: Crear Solicitud CON PDF a través de la API (Cloud Run)\n', 'cyan');
    log(`📍 API URL: ${API_URL}`, 'blue');
    
    // Mostrar datos que vamos a enviar
    log('\n📋 Datos de la solicitud:', 'cyan');
    console.log(JSON.stringify(solicitudData, null, 2));
    log('\n✅ El servidor DEBERÍA generar el PDF automáticamente\n', 'green');
    
    // Intentar crear la solicitud
    log('📤 Enviando solicitud POST a /api/v1/solicitudes...', 'yellow');
    
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/api/v1/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(solicitudData)
    });
    const endTime = Date.now();
    
    const responseData = await response.json();
    
    log(`\n📥 Respuesta del servidor:`, 'cyan');
    log(`   Status: ${response.status}`, response.status === 201 ? 'green' : 'red');
    log(`   Tiempo de respuesta: ${endTime - startTime}ms`, 'cyan');
    
    if (response.ok) {
      log('\n✅ Solicitud creada exitosamente!', 'green');
      log('\n📊 RESULTADO:', 'cyan');
      log('┌─────────────────────────────────────────────────┐', 'cyan');
      
      if (responseData.data) {
        log(`│ ID: ${responseData.data.id || 'N/A'}`, 'cyan');
        log(`│ Email: ${responseData.data.email || 'N/A'}`, 'cyan');
        log(`│ Nombre: ${responseData.data.nombreCompleto || 'N/A'}`, 'cyan');
        
        // Verificar el campo documento
        if (responseData.data.documento) {
          log(`│ Documento: ✅ PRESENTE`, 'green');
          if (responseData.data.documento.url) {
            log(`│   - URL: ✅ ${responseData.data.documento.url.substring(0, 60)}...`, 'green');
          } else {
            log(`│   - URL: ❌ NO PRESENTE`, 'red');
          }
          log(`│   - Path: ${responseData.data.documento.path || 'N/A'}`, 'cyan');
          log(`│   - FileName: ${responseData.data.documento.fileName || 'N/A'}`, 'cyan');
          log(`│   - OriginalName: ${responseData.data.documento.originalName || 'N/A'}`, 'cyan');
        } else {
          log(`│ Documento: ❌ NO PRESENTE`, 'red');
          log(`│   ⚠️  PROBLEMA: El PDF debería haberse generado pero no está`, 'yellow');
        }
      }
      
      log('└─────────────────────────────────────────────────┘', 'cyan');
      
      // Análisis específico del campo documento
      log('\n🔍 Análisis del campo "documento":', 'yellow');
      if (responseData.data && responseData.data.documento) {
        if (responseData.data.documento.url) {
          log('   ✅ Campo "documento" está presente con URL válida', 'green');
          log('   📌 El PDF se generó y subió correctamente', 'cyan');
          log(`   🔗 URL: ${responseData.data.documento.url}`, 'blue');
        } else {
          log('   ⚠️  Campo "documento" está presente pero sin URL', 'yellow');
          log('   📌 El objeto existe pero no tiene URL válida', 'cyan');
        }
      } else {
        log('   ❌ Campo "documento" NO está presente en la respuesta', 'red');
        log('   📌 PROBLEMA DETECTADO:', 'red');
        log('      El servidor creó la solicitud pero NO generó el PDF', 'yellow');
        log('      O el PDF se generó pero NO se guardó en Firestore', 'yellow');
      }
      
      log('\n📝 Respuesta completa del servidor:', 'blue');
      console.log(JSON.stringify(responseData, null, 2));
      
    } else {
      log('\n❌ Error al crear solicitud', 'red');
      log(`\n📋 Respuesta de error:`, 'yellow');
      console.log(JSON.stringify(responseData, null, 2));
    }
    
    process.exit(0);
    
  } catch (error) {
    log(`\n❌ Error en el test: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

// Ejecutar test
testAPIConPDF();

