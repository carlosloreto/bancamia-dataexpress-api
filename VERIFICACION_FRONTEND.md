# ✅ Verificación de la Llamada del Frontend

## 📋 Tu Llamada Actual

```bash
curl -X POST http://localhost:3000/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Juan Pérez",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle 123 #45-67",
    "celularNegocio": "3001234567"
  }'
```

## ✅ Lo que está BIEN:

1. **Método:** `POST` ✅
2. **Content-Type:** `application/json` ✅
3. **Estructura de datos:** Todos los campos requeridos están presentes ✅
4. **Tipos de datos:** 
   - Booleanos son `true`/`false` (no strings) ✅
   - Fechas en formato `YYYY-MM-DD` ✅
   - Strings correctos ✅
5. **Endpoint:** `/api/solicitudes` ✅

## ⚠️ Lo que DEBES VERIFICAR:

### 1. Puerto Correcto

**Tu código usa:** `http://localhost:3000`  
**La API está en:** `http://localhost:3001` (porque el 3000 está ocupado por tu frontend Next.js)

**Solución:**
```javascript
// En tu frontend, cambia:
const API_URL = 'http://localhost:3001'; // ✅ Correcto
// En lugar de:
const API_URL = 'http://localhost:3000'; // ❌ Incorrecto
```

### 2. URL Completa

Asegúrate de usar la URL completa:
```javascript
// ✅ Correcto
fetch('http://localhost:3001/api/solicitudes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos)
})

// O si prefieres usar la ruta con versión:
fetch('http://localhost:3001/api/v1/solicitudes', {
  // ... mismo código
})
```

## 📝 Ejemplo Completo para tu Frontend

### Con Fetch API:
```javascript
const crearSolicitud = async (datos) => {
  try {
    const response = await fetch('http://localhost:3001/api/solicitudes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: datos.email,
        autorizacionTratamientoDatos: datos.autorizacionTratamientoDatos,
        autorizacionContacto: datos.autorizacionContacto,
        nombreCompleto: datos.nombreCompleto,
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento,
        fechaNacimiento: datos.fechaNacimiento,
        fechaExpedicionDocumento: datos.fechaExpedicionDocumento,
        ciudadNegocio: datos.ciudadNegocio,
        direccionNegocio: datos.direccionNegocio,
        celularNegocio: datos.celularNegocio
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al crear solicitud');
    }

    const result = await response.json();
    
    // ✅ El PDF se genera automáticamente
    console.log('Solicitud creada:', result.data.id);
    console.log('PDF generado:', result.data.documento.url);
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Con Axios:
```javascript
import axios from 'axios';

const crearSolicitud = async (datos) => {
  try {
    const response = await axios.post(
      'http://localhost:3001/api/solicitudes',
      {
        email: datos.email,
        autorizacionTratamientoDatos: datos.autorizacionTratamientoDatos,
        autorizacionContacto: datos.autorizacionContacto,
        nombreCompleto: datos.nombreCompleto,
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento,
        fechaNacimiento: datos.fechaNacimiento,
        fechaExpedicionDocumento: datos.fechaExpedicionDocumento,
        ciudadNegocio: datos.ciudadNegocio,
        direccionNegocio: datos.direccionNegocio,
        celularNegocio: datos.celularNegocio
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // ✅ El PDF se genera automáticamente
    console.log('Solicitud creada:', response.data.data.id);
    console.log('PDF generado:', response.data.data.documento.url);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Error de respuesta del servidor
      console.error('Error del servidor:', error.response.data);
    } else {
      // Error de red
      console.error('Error de red:', error.message);
    }
    throw error;
  }
};
```

## 🎯 Respuesta Esperada

Cuando todo funciona correctamente, recibirás:

```json
{
  "success": true,
  "message": "Solicitud de crédito creada exitosamente",
  "data": {
    "id": "abc123def456",
    "email": "usuario@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Juan Pérez",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle 123 #45-67",
    "celularNegocio": "3001234567",
    "documento": {
      "url": "https://firebasestorage.googleapis.com/.../solicitud_1234567890_1234567890.pdf",
      "path": "solicitudes/.../solicitud_1234567890_1234567890.pdf",
      "fileName": "solicitud_1234567890_1234567890.pdf",
      "originalName": "solicitud_1234567890_1234567890.pdf"
    },
    "estado": "pendiente",
    "fechaSolicitud": "2025-12-07T22:46:58.000Z",
    "createdAt": "2025-12-07T22:46:58.000Z",
    "updatedAt": "2025-12-07T22:46:58.000Z"
  }
}
```

## 🔍 Verificaciones Finales

### ✅ Checklist:

- [ ] Puerto correcto: `3001` (no `3000`)
- [ ] URL completa: `http://localhost:3001/api/solicitudes`
- [ ] Content-Type: `application/json`
- [ ] Todos los campos requeridos presentes
- [ ] Booleanos son `true`/`false` (no strings)
- [ ] Fechas en formato `YYYY-MM-DD`
- [ ] Manejo de errores implementado
- [ ] Verificar que `documento.url` existe en la respuesta

## 🐛 Si Algo No Funciona

1. **Verifica que la API esté corriendo:**
   ```bash
   curl http://localhost:3001/
   ```

2. **Prueba la API directamente:**
   ```bash
   curl -X POST http://localhost:3001/api/solicitudes \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","autorizacionTratamientoDatos":true,"autorizacionContacto":true,"nombreCompleto":"Test","tipoDocumento":"CC","numeroDocumento":"1234567890","fechaNacimiento":"1990-01-15","fechaExpedicionDocumento":"2020-01-15","ciudadNegocio":"201","direccionNegocio":"Calle 123","celularNegocio":"3001234567"}'
   ```

3. **Revisa la consola del navegador:**
   - F12 → Console
   - Busca errores en rojo

4. **Revisa la pestaña Network:**
   - F12 → Network
   - Busca la petición a `/api/solicitudes`
   - Revisa Status, Request y Response

---

**¡Tu estructura está perfecta! Solo asegúrate de usar el puerto 3001. 🚀**


