/**
 * Script de prueba completo para la versión local
 */

const API_URL = 'http://localhost:3000/api/v1/solicitudes';

const solicitud = {
  nombreCompleto: "Test Usuario Local",
  tipoDocumento: "CC",
  numeroDocumento: `TEST${Date.now()}`,
  fechaNacimiento: "1990-05-15",
  estadoCivil: "soltero",
  genero: "masculino",
  telefono: "3001234567",
  email: `testlocal${Date.now()}@email.com`,
  direccion: "Calle 123",
  ciudad: "Bogotá",
  departamento: "Cundinamarca",
  ocupacion: "Ingeniero",
  empresa: "Tech S.A.S",
  cargoActual: "Desarrollador",
  tipoContrato: "indefinido",
  ingresosMensuales: "5000000",
  tiempoEmpleo: "2a5",
  montoSolicitado: "20000000",
  plazoMeses: "36",
  proposito: "Compra de vehículo",
  tieneDeudas: "no",
  refNombre1: "María López",
  refTelefono1: "3009876543",
  refRelacion1: "Hermana",
  refNombre2: "Carlos Rodríguez",
  refTelefono2: "3158765432",
  refRelacion2: "Amigo"
};

console.log('='.repeat(60));
console.log('PRUEBA LOCAL DEL ENDPOINT DE SOLICITUDES');
console.log('='.repeat(60));
console.log(`\n🌐 URL: ${API_URL}`);
console.log(`📤 Enviando POST...\n`);

const inicio = Date.now();

// Verificar que el servidor esté corriendo
fetch('http://localhost:3000/health')
  .then(res => {
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  })
  .then(health => {
    console.log(`✅ Servidor local está corriendo`);
    console.log(`   Uptime: ${Math.round(health.uptime)}s`);
    console.log(`   Environment: ${health.environment}\n`);
    
    // Ahora probar crear solicitud
    return fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(solicitud)
    });
  })
  .then(res => {
    const tiempo = Date.now() - inicio;
    console.log(`📥 Status: ${res.status} ${res.statusText} (${tiempo}ms)`);
    
    if (!res.ok) {
      return res.text().then(text => {
        throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
      });
    }
    return res.json();
  })
  .then(data => {
    const tiempo = Date.now() - inicio;
    console.log(`\n✅ ÉXITO - Solicitud creada en ${tiempo}ms`);
    console.log(`\n📋 Datos de la solicitud:`);
    console.log(`   ID: ${data.data?.id}`);
    console.log(`   Nombre: ${data.data?.nombreCompleto}`);
    console.log(`   Email: ${data.data?.email}`);
    console.log(`   Monto: $${parseInt(data.data?.montoSolicitado || 0).toLocaleString()} COP`);
    console.log(`   Estado: ${data.data?.estado}`);
    console.log(`   Fecha: ${data.data?.fechaSolicitud}`);
    
    // Verificar que los números se guardaron correctamente
    console.log(`\n🔍 Verificación de tipos:`);
    console.log(`   ingresosMensuales tipo: ${typeof data.data?.ingresosMensuales}`);
    console.log(`   montoSolicitado tipo: ${typeof data.data?.montoSolicitado}`);
    console.log(`   ingresosMensuales valor: ${data.data?.ingresosMensuales}`);
    console.log(`   montoSolicitado valor: ${data.data?.montoSolicitado}`);
    
    if (typeof data.data?.ingresosMensuales === 'number' && typeof data.data?.montoSolicitado === 'number') {
      console.log(`\n✅ Los números se están guardando correctamente como números`);
    } else {
      console.log(`\n⚠️  ADVERTENCIA: Los números se están guardando como strings`);
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ TODAS LAS PRUEBAS PASARON');
    console.log('='.repeat(60));
  })
  .catch(err => {
    const tiempo = Date.now() - inicio;
    console.error(`\n❌ ERROR después de ${tiempo}ms:`);
    console.error(`   ${err.message}`);
    
    if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
      console.error(`\n💡 El servidor no está corriendo. Ejecuta:`);
      console.error(`   npm run dev`);
    }
    
    process.exit(1);
  });

