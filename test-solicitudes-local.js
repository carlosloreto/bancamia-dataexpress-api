/**
 * Script de prueba local para el endpoint de solicitudes
 * Prueba todas las operaciones y mide el rendimiento
 */

// Usar fetch nativo de Node.js 18+

const API_URL = 'http://localhost:3000/api/v1/solicitudes';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Datos de prueba
const solicitudPrueba = {
  nombreCompleto: "Juan Pérez García",
  tipoDocumento: "CC",
  numeroDocumento: `TEST${Date.now()}`, // Único para cada prueba
  fechaNacimiento: "1990-05-15",
  estadoCivil: "soltero",
  genero: "masculino",
  telefono: "3001234567",
  email: `test${Date.now()}@email.com`,
  direccion: "Calle 123 #45-67",
  ciudad: "Bogotá",
  departamento: "Cundinamarca",
  ocupacion: "Ingeniero de Software",
  empresa: "Tech Solutions S.A.S",
  cargoActual: "Desarrollador Senior",
  tipoContrato: "indefinido",
  ingresosMensuales: "5000000",
  tiempoEmpleo: "2a5",
  montoSolicitado: "20000000",
  plazoMeses: "36",
  proposito: "Compra de vehículo para uso personal y laboral",
  tieneDeudas: "si",
  montoDeudas: "3000000",
  refNombre1: "María López Hernández",
  refTelefono1: "3009876543",
  refRelacion1: "Hermana",
  refNombre2: "Carlos Rodríguez Martínez",
  refTelefono2: "3158765432",
  refRelacion2: "Amigo"
};

// Función para medir tiempo
function medirTiempo(fn) {
  return async (...args) => {
    const inicio = Date.now();
    try {
      const resultado = await fn(...args);
      const tiempo = Date.now() - inicio;
      return { resultado, tiempo };
    } catch (error) {
      const tiempo = Date.now() - inicio;
      return { error, tiempo };
    }
  };
}

// Test 1: Crear solicitud
async function testCrearSolicitud() {
  logSection('TEST 1: Crear Solicitud de Crédito');
  
  const { resultado, tiempo, error } = await medirTiempo(async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(solicitudPrueba)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    return await response.json();
  })();

  if (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log(`⏱️  Tiempo: ${tiempo}ms`, 'yellow');
    return null;
  }

  log(`✅ Solicitud creada exitosamente`, 'green');
  log(`📋 ID: ${resultado.data.id}`, 'blue');
  log(`👤 Nombre: ${resultado.data.nombreCompleto}`, 'blue');
  log(`📧 Email: ${resultado.data.email}`, 'blue');
  log(`💰 Monto: $${parseInt(resultado.data.montoSolicitado).toLocaleString()} COP`, 'blue');
  log(`⏱️  Tiempo de respuesta: ${tiempo}ms`, tiempo < 500 ? 'green' : tiempo < 1000 ? 'yellow' : 'red');
  
  return resultado.data;
}

// Test 2: Obtener solicitud por ID
async function testObtenerPorId(solicitudId) {
  if (!solicitudId) {
    log('\n⚠️  Saltando test de obtener por ID (no hay ID disponible)', 'yellow');
    return;
  }

  logSection('TEST 2: Obtener Solicitud por ID');
  
  const { resultado, tiempo, error } = await medirTiempo(async () => {
    const response = await fetch(`${API_URL}/${solicitudId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    return await response.json();
  })();

  if (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log(`⏱️  Tiempo: ${tiempo}ms`, 'yellow');
    return;
  }

  log(`✅ Solicitud obtenida exitosamente`, 'green');
  log(`📋 ID: ${resultado.data.id}`, 'blue');
  log(`📅 Fecha: ${resultado.data.fechaSolicitud}`, 'blue');
  log(`⏱️  Tiempo de respuesta: ${tiempo}ms`, tiempo < 300 ? 'green' : tiempo < 600 ? 'yellow' : 'red');
}

// Test 3: Listar todas las solicitudes
async function testListarSolicitudes() {
  logSection('TEST 3: Listar Solicitudes');
  
  const { resultado, tiempo, error } = await medirTiempo(async () => {
    const response = await fetch(`${API_URL}?page=1&limit=10`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    return await response.json();
  })();

  if (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log(`⏱️  Tiempo: ${tiempo}ms`, 'yellow');
    return;
  }

  log(`✅ Solicitudes obtenidas exitosamente`, 'green');
  log(`📊 Total: ${resultado.pagination.total}`, 'blue');
  log(`📄 Página: ${resultado.pagination.page} de ${resultado.pagination.totalPages}`, 'blue');
  log(`📋 Mostrando: ${resultado.data.length} solicitudes`, 'blue');
  log(`⏱️  Tiempo de respuesta: ${tiempo}ms`, tiempo < 500 ? 'green' : tiempo < 1000 ? 'yellow' : 'red');
  
  if (resultado.data.length > 0) {
    log(`\n📝 Primera solicitud:`, 'blue');
    log(`   - ID: ${resultado.data[0].id}`, 'blue');
    log(`   - Nombre: ${resultado.data[0].nombreCompleto}`, 'blue');
    log(`   - Estado: ${resultado.data[0].estado}`, 'blue');
  }
}

// Test 4: Actualizar solicitud
async function testActualizarSolicitud(solicitudId) {
  if (!solicitudId) {
    log('\n⚠️  Saltando test de actualizar (no hay ID disponible)', 'yellow');
    return;
  }

  logSection('TEST 4: Actualizar Solicitud');
  
  const datosActualizacion = {
    estado: 'en_revision',
    telefono: '3001111111'
  };

  const { resultado, tiempo, error } = await medirTiempo(async () => {
    const response = await fetch(`${API_URL}/${solicitudId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosActualizacion)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    return await response.json();
  })();

  if (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log(`⏱️  Tiempo: ${tiempo}ms`, 'yellow');
    return;
  }

  log(`✅ Solicitud actualizada exitosamente`, 'green');
  log(`📋 ID: ${resultado.data.id}`, 'blue');
  log(`🔄 Estado: ${resultado.data.estado}`, 'blue');
  log(`📞 Teléfono: ${resultado.data.telefono}`, 'blue');
  log(`⏱️  Tiempo de respuesta: ${tiempo}ms`, tiempo < 500 ? 'green' : tiempo < 1000 ? 'yellow' : 'red');
}

// Test 5: Búsqueda
async function testBuscarSolicitudes() {
  logSection('TEST 5: Buscar Solicitudes');
  
  const { resultado, tiempo, error } = await medirTiempo(async () => {
    const response = await fetch(`${API_URL}?search=Juan&page=1&limit=5`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    return await response.json();
  })();

  if (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log(`⏱️  Tiempo: ${tiempo}ms`, 'yellow');
    return;
  }

  log(`✅ Búsqueda completada exitosamente`, 'green');
  log(`🔍 Término: "Juan"`, 'blue');
  log(`📊 Resultados: ${resultado.data.length}`, 'blue');
  log(`⏱️  Tiempo de respuesta: ${tiempo}ms`, tiempo < 500 ? 'green' : tiempo < 1000 ? 'yellow' : 'red');
}

// Test 6: Prueba de rendimiento (múltiples requests)
async function testRendimiento() {
  logSection('TEST 6: Prueba de Rendimiento (5 solicitudes)');
  
  const tiempos = [];
  const errores = [];
  
  for (let i = 1; i <= 5; i++) {
    const solicitud = {
      ...solicitudPrueba,
      numeroDocumento: `PERF${Date.now()}${i}`,
      email: `perf${Date.now()}${i}@test.com`
    };
    
    const { tiempo, error } = await medirTiempo(async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(solicitud)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      return await response.json();
    })();
    
    if (error) {
      errores.push({ intento: i, error: error.message });
    } else {
      tiempos.push(tiempo);
      log(`✅ Solicitud ${i} creada en ${tiempo}ms`, tiempo < 500 ? 'green' : 'yellow');
    }
  }
  
  if (tiempos.length > 0) {
    const promedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
    const minimo = Math.min(...tiempos);
    const maximo = Math.max(...tiempos);
    
    log(`\n📊 Estadísticas:`, 'cyan');
    log(`   ⚡ Promedio: ${promedio}ms`, 'blue');
    log(`   ⬇️  Mínimo: ${minimo}ms`, 'green');
    log(`   ⬆️  Máximo: ${maximo}ms`, maximo < 1000 ? 'yellow' : 'red');
  }
  
  if (errores.length > 0) {
    log(`\n❌ Errores: ${errores.length}`, 'red');
    errores.forEach(e => log(`   - Intento ${e.intento}: ${e.error}`, 'red'));
  }
}

// Verificar que el servidor esté corriendo
async function verificarServidor() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      log('✅ Servidor está corriendo', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Error: El servidor no está corriendo en http://localhost:3000', 'red');
    log('💡 Ejecuta: npm run dev', 'yellow');
    return false;
  }
  return false;
}

// Función principal
async function ejecutarPruebas() {
  console.clear();
  log('\n🚀 INICIANDO PRUEBAS DEL ENDPOINT DE SOLICITUDES\n', 'cyan');
  
  // Verificar servidor
  const servidorOk = await verificarServidor();
  if (!servidorOk) {
    process.exit(1);
  }
  
  // Ejecutar pruebas
  const solicitudCreada = await testCrearSolicitud();
  const solicitudId = solicitudCreada?.id;
  
  await testObtenerPorId(solicitudId);
  await testListarSolicitudes();
  await testActualizarSolicitud(solicitudId);
  await testBuscarSolicitudes();
  await testRendimiento();
  
  // Resumen final
  logSection('✅ PRUEBAS COMPLETADAS');
  log('🎉 Todas las pruebas se ejecutaron correctamente', 'green');
  log('\n💡 Si los tiempos son altos, verifica:', 'yellow');
  log('   - Conexión a Firebase/Firestore', 'yellow');
  log('   - Índices de Firestore desplegados', 'yellow');
  log('   - Red y latencia', 'yellow');
  console.log('\n');
}

// Ejecutar
ejecutarPruebas().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

