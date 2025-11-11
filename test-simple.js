/**
 * Script de prueba simplificado - Sin procesamiento de headers
 */

// Cambiar entre local y producción
const API_URL_LOCAL = 'http://localhost:3000/api/v1/solicitudes';
const API_URL_PROD = 'https://bancamia-dataexpress-api-848620556467.southamerica-east1.run.app/api/v1/solicitudes';

// Usar local para pruebas
const API_URL = API_URL_LOCAL;

const solicitud = {
  nombreCompleto: "Test Usuario",
  tipoDocumento: "CC",
  numeroDocumento: `TEST${Date.now()}`,
  fechaNacimiento: "1990-05-15",
  estadoCivil: "soltero",
  genero: "masculino",
  telefono: "3001234567",
  email: `test${Date.now()}@email.com`,
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

console.log('🚀 Enviando solicitud a:', API_URL);
const inicio = Date.now();

fetch(API_URL, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(solicitud)
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
    console.log(`✅ Éxito en ${tiempo}ms`);
    console.log(`📋 ID: ${data.data?.id}`);
    console.log(`👤 Nombre: ${data.data?.nombreCompleto}`);
    console.log(`📧 Email: ${data.data?.email}`);
    console.log(`💰 Monto: $${parseInt(data.data?.montoSolicitado || 0).toLocaleString()} COP`);
  })
  .catch(err => {
    const tiempo = Date.now() - inicio;
    console.error(`❌ Error después de ${tiempo}ms:`);
    console.error(`   ${err.message}`);
    if (err.stack) {
      console.error(`   Stack: ${err.stack.split('\n')[0]}`);
    }
    process.exit(1);
  });

