# 📋 Ejemplo Detallado: Crear Solicitud de Crédito con Generación de PDF

## 🎯 Descripción
Este documento muestra cómo enviar una solicitud de crédito a la API para que se genere automáticamente un PDF con los datos proporcionados.

---

## 🔗 Endpoint

**URL:** `POST http://localhost:3001/api/solicitudes`  
**Alternativa:** `POST http://localhost:3001/api/v1/solicitudes`

**Content-Type:** `application/json`  
**Autenticación:** No requerida (público)

---

## 📝 Estructura del JSON

### Campos Requeridos

Todos los siguientes campos son **OBLIGATORIOS**:

```json
{
  "email": "string (email válido)",
  "autorizacionTratamientoDatos": "boolean (true/false)",
  "autorizacionContacto": "boolean (true/false)",
  "nombreCompleto": "string (nombre y apellidos)",
  "tipoDocumento": "string (CC | CE | PA | PEP | PPP)",
  "numeroDocumento": "string (solo números)",
  "fechaNacimiento": "string (formato: YYYY-MM-DD)",
  "fechaExpedicionDocumento": "string (formato: YYYY-MM-DD)",
  "ciudadNegocio": "string (código o nombre de ciudad)",
  "direccionNegocio": "string (dirección completa)",
  "celularNegocio": "string (número de teléfono)"
}
```

---

## ✅ Ejemplo Completo de Solicitud

### Ejemplo 1: Solicitud Básica

```json
{
  "email": "juan.perez@example.com",
  "autorizacionTratamientoDatos": true,
  "autorizacionContacto": true,
  "nombreCompleto": "Juan Pérez García",
  "tipoDocumento": "CC",
  "numeroDocumento": "1234567890",
  "fechaNacimiento": "1990-01-15",
  "fechaExpedicionDocumento": "2020-01-15",
  "ciudadNegocio": "201",
  "direccionNegocio": "Calle 123 #45-67, Barrio Centro",
  "celularNegocio": "3001234567"
}
```

### Ejemplo 2: Con Cédula de Extranjería

```json
{
  "email": "maria.gonzalez@example.com",
  "autorizacionTratamientoDatos": true,
  "autorizacionContacto": false,
  "nombreCompleto": "María González Rodríguez",
  "tipoDocumento": "CE",
  "numeroDocumento": "9876543210",
  "fechaNacimiento": "1985-05-20",
  "fechaExpedicionDocumento": "2019-05-20",
  "ciudadNegocio": "Bogotá",
  "direccionNegocio": "Avenida 68 #45-30, Local 5",
  "celularNegocio": "3109876543"
}
```

### Ejemplo 3: Con Pasaporte

```json
{
  "email": "carlos.rodriguez@example.com",
  "autorizacionTratamientoDatos": true,
  "autorizacionContacto": true,
  "nombreCompleto": "Carlos Andrés Rodríguez López",
  "tipoDocumento": "PA",
  "numeroDocumento": "AB123456",
  "fechaNacimiento": "1992-11-30",
  "fechaExpedicionDocumento": "2021-11-30",
  "ciudadNegocio": "Medellín",
  "direccionNegocio": "Carrera 50 #30-15, Piso 2",
  "celularNegocio": "3201234567"
}
```

---

## 🔧 Comandos cURL

### Windows PowerShell

```powershell
$body = @{
    email = "juan.perez@example.com"
    autorizacionTratamientoDatos = $true
    autorizacionContacto = $true
    nombreCompleto = "Juan Pérez García"
    tipoDocumento = "CC"
    numeroDocumento = "1234567890"
    fechaNacimiento = "1990-01-15"
    fechaExpedicionDocumento = "2020-01-15"
    ciudadNegocio = "201"
    direccionNegocio = "Calle 123 #45-67, Barrio Centro"
    celularNegocio = "3001234567"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/solicitudes" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Linux/Mac/Git Bash

```bash
curl -X POST http://localhost:3001/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Juan Pérez García",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle 123 #45-67, Barrio Centro",
    "celularNegocio": "3001234567"
  }'
```

---

## 📋 Validaciones y Reglas

### 1. Email
- **Formato:** Debe ser un email válido
- **Ejemplo válido:** `usuario@example.com`
- **Ejemplo inválido:** `usuario@` o `@example.com`

### 2. Autorizaciones
- **Tipo:** Boolean (`true` o `false`)
- **También acepta:** String `"true"` o `"false"`
- **Requerido:** Ambos campos deben estar presentes

### 3. Nombre Completo
- **Tipo:** String
- **No puede estar vacío**
- **Ejemplo válido:** `"Juan Pérez García"`

### 4. Tipo de Documento
- **Valores permitidos:**
  - `"CC"` - Cédula de Ciudadanía
  - `"CE"` - Cédula de Extranjería
  - `"PA"` - Pasaporte
  - `"PEP"` - Permiso Especial de Permanencia
  - `"PPP"` - Permiso por Protección Temporal
- **Case sensitive:** Debe ser exactamente como se muestra

### 5. Número de Documento
- **Tipo:** String (puede contener números y letras)
- **Ejemplo CC:** `"1234567890"`
- **Ejemplo Pasaporte:** `"AB123456"`

### 6. Fecha de Nacimiento
- **Formato:** `YYYY-MM-DD` (ISO 8601)
- **Validaciones:**
  - Debe ser una fecha válida
  - Debe ser anterior a la fecha actual
  - El solicitante debe ser mayor de 18 años
- **Ejemplo válido:** `"1990-01-15"`
- **Ejemplo inválido:** `"2025-01-15"` (fecha futura)

### 7. Fecha de Expedición del Documento
- **Formato:** `YYYY-MM-DD` (ISO 8601)
- **Validaciones:**
  - Debe ser una fecha válida
  - No puede ser una fecha futura
- **Ejemplo válido:** `"2020-01-15"`

### 8. Ciudad del Negocio
- **Tipo:** String
- **Puede ser:** Código de ciudad o nombre
- **Ejemplos:** `"201"`, `"Bogotá"`, `"Medellín"`

### 9. Dirección del Negocio
- **Tipo:** String
- **No puede estar vacío**
- **Ejemplo:** `"Calle 123 #45-67, Barrio Centro"`

### 10. Celular del Negocio
- **Tipo:** String
- **Formato:** Solo números, guiones, espacios, paréntesis y el símbolo +
- **Ejemplos válidos:** `"3001234567"`, `"300-123-4567"`, `"(300) 123-4567"`

---

## 📤 Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Solicitud de crédito creada exitosamente",
  "data": {
    "id": "abc123def456",
    "email": "juan.perez@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Juan Pérez García",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle 123 #45-67, Barrio Centro",
    "celularNegocio": "3001234567",
    "documento": {
      "url": "https://firebasestorage.googleapis.com/v0/b/.../solicitud_1234567890_1234567890.pdf",
      "path": "solicitudes/1234567890_1234567890/solicitud_1234567890_1234567890.pdf",
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

### Campos Importantes en la Respuesta:

- **`id`**: ID único de la solicitud en Firestore
- **`documento.url`**: URL pública del PDF generado (puedes descargarlo desde aquí)
- **`documento.path`**: Ruta del archivo en Firebase Storage
- **`estado`**: Estado inicial de la solicitud (`"pendiente"`)

---

## ❌ Errores Comunes

### Error 400: Campos Faltantes

```json
{
  "success": false,
  "error": {
    "message": "Datos de solicitud inválidos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "errors": [
        {
          "type": "missing_fields",
          "message": "Faltan campos requeridos",
          "fields": ["email", "nombreCompleto"]
        }
      ]
    }
  }
}
```

### Error 400: Formato de Email Inválido

```json
{
  "success": false,
  "error": {
    "message": "Datos de solicitud inválidos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "errors": [
        {
          "type": "invalid_format",
          "field": "email",
          "message": "El formato del email es inválido"
        }
      ]
    }
  }
}
```

### Error 400: Tipo de Documento Inválido

```json
{
  "success": false,
  "error": {
    "message": "Datos de solicitud inválidos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "errors": [
        {
          "type": "invalid_value",
          "field": "tipoDocumento",
          "message": "Tipo de documento inválido",
          "validValues": ["CC", "CE", "PA", "PEP", "PPP"]
        }
      ]
    }
  }
}
```

### Error 400: Edad Insuficiente

```json
{
  "success": false,
  "error": {
    "message": "Datos de solicitud inválidos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "errors": [
        {
          "type": "invalid_value",
          "field": "fechaNacimiento",
          "message": "El solicitante debe ser mayor de 18 años"
        }
      ]
    }
  }
}
```

### Error 500: Error al Generar PDF

```json
{
  "success": false,
  "error": {
    "message": "Error al generar el documento PDF",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "errors": [
        {
          "type": "pdf_generation_error",
          "field": "documento",
          "message": "No se pudo generar el documento PDF: [detalle del error]"
        }
      ]
    }
  }
}
```

---

## 💻 Ejemplo con JavaScript (Fetch API)

```javascript
const crearSolicitud = async () => {
  const datosSolicitud = {
    email: "juan.perez@example.com",
    autorizacionTratamientoDatos: true,
    autorizacionContacto: true,
    nombreCompleto: "Juan Pérez García",
    tipoDocumento: "CC",
    numeroDocumento: "1234567890",
    fechaNacimiento: "1990-01-15",
    fechaExpedicionDocumento: "2020-01-15",
    ciudadNegocio: "201",
    direccionNegocio: "Calle 123 #45-67, Barrio Centro",
    celularNegocio: "3001234567"
  };

  try {
    const response = await fetch('http://localhost:3001/api/solicitudes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosSolicitud)
    });

    const resultado = await response.json();

    if (response.ok) {
      console.log('✅ Solicitud creada exitosamente');
      console.log('ID de solicitud:', resultado.data.id);
      console.log('URL del PDF:', resultado.data.documento.url);
      return resultado;
    } else {
      console.error('❌ Error al crear solicitud:', resultado);
      throw new Error(resultado.error?.message || 'Error desconocido');
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    throw error;
  }
};

// Llamar la función
crearSolicitud();
```

---

## 💻 Ejemplo con Axios

```javascript
import axios from 'axios';

const crearSolicitud = async () => {
  const datosSolicitud = {
    email: "juan.perez@example.com",
    autorizacionTratamientoDatos: true,
    autorizacionContacto: true,
    nombreCompleto: "Juan Pérez García",
    tipoDocumento: "CC",
    numeroDocumento: "1234567890",
    fechaNacimiento: "1990-01-15",
    fechaExpedicionDocumento: "2020-01-15",
    ciudadNegocio: "201",
    direccionNegocio: "Calle 123 #45-67, Barrio Centro",
    celularNegocio: "3001234567"
  };

  try {
    const response = await axios.post(
      'http://localhost:3001/api/solicitudes',
      datosSolicitud,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Solicitud creada:', response.data);
    console.log('📄 PDF generado:', response.data.data.documento.url);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Error de respuesta del servidor
      console.error('❌ Error del servidor:', error.response.data);
    } else if (error.request) {
      // Error de red
      console.error('❌ Error de red:', error.request);
    } else {
      // Otro error
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
};

crearSolicitud();
```

---

## 📄 Contenido del PDF Generado

El PDF generado automáticamente incluirá:

1. **Encabezado:**
   - Título: "SOLICITUD DE CRÉDITO"
   - Subtítulo: "Bancamia DataExpress"

2. **Información Personal:**
   - Nombre Completo
   - Tipo y Número de Documento
   - Fecha de Nacimiento
   - Fecha de Expedición del Documento
   - Email

3. **Información del Negocio:**
   - Ciudad
   - Dirección
   - Celular

4. **Autorizaciones:**
   - Autorización Tratamiento de Datos (Sí/No)
   - Autorización de Contacto (Sí/No)

5. **Pie de Página:**
   - Fecha y hora de generación del PDF

---

## 🔍 Verificar que el PDF se Generó

Después de crear la solicitud, puedes:

1. **Descargar el PDF desde la URL:**
   ```bash
   # Usando curl
   curl -O "https://firebasestorage.googleapis.com/v0/b/.../solicitud_1234567890_1234567890.pdf"
   ```

2. **Abrir en el navegador:**
   - Copia la URL del campo `documento.url` en la respuesta
   - Ábrela en tu navegador para ver/descargar el PDF

3. **Verificar en Firebase Storage:**
   - Ve a Firebase Console → Storage
   - Busca en la carpeta `solicitudes/[solicitudId]/`

---

## 📝 Checklist Antes de Enviar

- [ ] Email tiene formato válido
- [ ] `autorizacionTratamientoDatos` es `true` o `false` (boolean)
- [ ] `autorizacionContacto` es `true` o `false` (boolean)
- [ ] `nombreCompleto` no está vacío
- [ ] `tipoDocumento` es uno de: `CC`, `CE`, `PA`, `PEP`, `PPP`
- [ ] `numeroDocumento` no está vacío
- [ ] `fechaNacimiento` está en formato `YYYY-MM-DD` y es anterior a hoy
- [ ] El solicitante tiene más de 18 años
- [ ] `fechaExpedicionDocumento` está en formato `YYYY-MM-DD` y no es futura
- [ ] `ciudadNegocio` no está vacío
- [ ] `direccionNegocio` no está vacío
- [ ] `celularNegocio` tiene formato válido

---

## 🚀 Prueba Rápida

Copia y pega este comando completo en tu terminal:

```bash
curl -X POST http://localhost:3001/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Test Usuario",
    "tipoDocumento": "CC",
    "numeroDocumento": "9999999999",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle Test 123",
    "celularNegocio": "3001234567"
  }'
```

---

**¡Listo!** Con esta información puedes crear solicitudes de crédito y el PDF se generará automáticamente. 🎉


