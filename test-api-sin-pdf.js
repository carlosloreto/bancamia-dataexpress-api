/**
 * Script para probar crear una solicitud SIN PDF a través de la API desplegada
 * 
 * Uso: node test-api-sin-pdf.js
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

// Datos de prueba SIN documento (el PDF se genera automáticamente en el servidor)
// Pero vamos a ver qué pasa si intentamos crear sin que se genere el PDF
const solicitudData = {
  email: `test.sinpdf.${Date.now()}@example.com`,
  autorizacionTratamientoDatos: true,
  autorizacionContacto: true,
  nombreCompleto: "Test Usuario Sin PDF API",
  tipoDocumento: "CC",
  numeroDocumento: `999${Date.now().toString().slice(-7)}`,
  fechaNacimiento: "1990-01-15",
  fechaExpedicionDocumento: "2020-01-15",
  ciudadNegocio: "201",
  direccionNegocio: "Calle Test Sin PDF API 123",
  celularNegocio: "3001234567"
};

async function testAPISinPDF() {
  try {
    log('\n🧪 TEST: Crear Solicitud a través de la API (Cloud Run)\n', 'cyan');
    log(`📍 API URL: ${API_URL}`, 'blue');
    
    // Verificar que la API esté disponible
    log('\n🔍 Verificando que la API esté disponible...', 'yellow');
    try {
      const healthCheck = await fetch(`${API_URL}/health`);
      if (healthCheck.ok) {
        log('   ✅ API está disponible', 'green');
      } else {
        log(`   ⚠️  API responde pero con status: ${healthCheck.status}`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ Error al conectar con la API: ${error.message}`, 'red');
      log('   Verifica que la URL sea correcta y que la API esté desplegada', 'yellow');
      process.exit(1);
    }
    
    // Mostrar datos que vamos a enviar
    log('\n📋 Datos de la solicitud:', 'cyan');
    console.log(JSON.stringify(solicitudData, null, 2));
    log('\n⚠️  NOTA: El servidor generará el PDF automáticamente', 'yellow');
    log('   Si el PDF falla, debería devolver un error\n', 'yellow');
    
    // Intentar crear la solicitud
    log('📤 Enviando solicitud POST a /api/v1/solicitudes...', 'yellow');
    
    const response = await fetch(`${API_URL}/api/v1/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(solicitudData)
    });
    
    const responseData = await response.json();
    
    log(`\n📥 Respuesta del servidor:`, 'cyan');
    log(`   Status: ${response.status}`, response.status === 201 ? 'green' : 'red');
    
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
          log(`│   - URL: ${responseData.data.documento.url ? '✅' : '❌'}`, 
              responseData.data.documento.url ? 'green' : 'red');
          log(`│   - Path: ${responseData.data.documento.path || 'N/A'}`, 'cyan');
          log(`│   - FileName: ${responseData.data.documento.fileName || 'N/A'}`, 'cyan');
        } else {
          log(`│ Documento: ❌ NO PRESENTE`, 'red');
          log(`│   El campo documento no está en la respuesta`, 'yellow');
        }
      }
      
      log('└─────────────────────────────────────────────────┘', 'cyan');
      
      log('\n📝 Respuesta completa del servidor:', 'blue');
      console.log(JSON.stringify(responseData, null, 2));
      
      // Análisis específico del campo documento
      log('\n🔍 Análisis del campo "documento":', 'yellow');
      if (responseData.data && responseData.data.documento) {
        if (responseData.data.documento === null) {
          log('   ⚠️  Campo "documento" está presente pero es null', 'yellow');
          log('   📌 Esto significa que se guardó como null en Firestore', 'cyan');
        } else if (typeof responseData.data.documento === 'object') {
          if (responseData.data.documento.url) {
            log('   ✅ Campo "documento" está presente con URL válida', 'green');
            log('   📌 El PDF se generó y subió correctamente', 'cyan');
          } else {
            log('   ⚠️  Campo "documento" está presente pero sin URL', 'yellow');
            log('   📌 El objeto existe pero no tiene URL válida', 'cyan');
          }
        }
      } else {
        log('   ❌ Campo "documento" NO está presente en la respuesta', 'red');
        log('   📌 Esto significa que:', 'cyan');
        log('      - El PDF no se generó, O', 'yellow');
        log('      - El campo no se guardó en Firestore, O', 'yellow');
        log('      - Hay un problema en el código del servidor', 'yellow');
      }
      
      log('\n✅ Test completado!', 'green');
      
    } else {
      log('\n❌ Error al crear solicitud', 'red');
      log(`\n📋 Respuesta de error:`, 'yellow');
      console.log(JSON.stringify(responseData, null, 2));
      
      // Verificar si es el error esperado de PDF
      if (responseData.errors && responseData.errors.some(e => e.type === 'pdf_generation_error')) {
        log('\n✅ Esto es el comportamiento esperado:', 'green');
        log('   El servidor detectó que el PDF no se pudo generar', 'cyan');
        log('   y lanzó un error para prevenir guardar sin PDF.', 'cyan');
      } else if (responseData.message && responseData.message.includes('PDF')) {
        log('\n✅ Esto es el comportamiento esperado:', 'green');
        log('   El servidor detectó un problema con el PDF', 'cyan');
        log('   y lanzó un error para prevenir guardar sin PDF.', 'cyan');
      }
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
testAPISinPDF();

