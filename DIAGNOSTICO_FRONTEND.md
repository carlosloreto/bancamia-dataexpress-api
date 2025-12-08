# 🔍 Guía de Diagnóstico para Problemas del Frontend

## 📋 Información Necesaria para Diagnosticar Problemas

### 1. **Error Específico**
- ¿Qué error exacto aparece? (mensaje completo)
- ¿En qué parte de la aplicación ocurre? (al enviar el formulario, al cargar, etc.)
- ¿Aparece en la consola del navegador? (F12 → Console)
- ¿Aparece en la red? (F12 → Network)

### 2. **Código del Frontend**
- ¿Cómo estás haciendo la petición? (fetch, axios, etc.)
- ¿Puedes compartir el código que envía la solicitud?
- ¿Qué URL estás usando? (`/api/solicitudes` o `/api/v1/solicitudes`)

### 3. **Datos que Envías**
- ¿Qué estructura de datos estás enviando?
- ¿Todos los campos están presentes?
- ¿Los valores son del tipo correcto? (booleanos, strings, fechas)

### 4. **Respuesta del Servidor**
- ¿Qué status code recibes? (200, 201, 400, 500, etc.)
- ¿Qué respuesta JSON recibes del servidor?
- ¿Hay algún mensaje de error en la respuesta?

### 5. **Configuración**
- ¿En qué puerto está corriendo tu frontend?
- ¿En qué puerto está corriendo la API? (debería ser 3001)
- ¿Hay algún proxy o CORS configurado?

---

## 🎯 Preguntas Específicas que Debes Responder

### Sobre el Error:
```
1. ¿Cuál es el mensaje de error exacto?
   Ejemplo: "Failed to fetch" o "Network Error" o "400 Bad Request"

2. ¿Cuándo ocurre el error?
   - Al hacer clic en "Enviar"
   - Después de unos segundos
   - Inmediatamente

3. ¿El formulario se envía pero no pasa nada?
   - ¿Se muestra algún loading?
   - ¿Se muestra algún mensaje de éxito/error?
```

### Sobre el Código:
```
4. ¿Puedes compartir el código que hace la petición?
   Ejemplo:
   - fetch('/api/solicitudes', {...})
   - axios.post('/api/solicitudes', {...})

5. ¿Cómo estás manejando la respuesta?
   - ¿Tienes .then() y .catch()?
   - ¿Estás usando async/await?
   - ¿Estás manejando errores?
```

### Sobre los Datos:
```
6. ¿Qué datos estás enviando exactamente?
   - ¿Todos los campos requeridos están presentes?
   - ¿Los booleanos son true/false o "true"/"false"?
   - ¿Las fechas están en formato YYYY-MM-DD?

7. ¿Puedes hacer console.log() de los datos antes de enviarlos?
```

### Sobre la Red:
```
8. ¿Qué ves en la pestaña Network del navegador?
   - ¿La petición se envía?
   - ¿Qué status code tiene?
   - ¿Qué respuesta viene del servidor?

9. ¿Hay algún error de CORS?
   - ¿Aparece "CORS policy" en la consola?
```

---

## 📝 Ejemplo de Información que Necesito

### ✅ Información Útil:
```javascript
// 1. Tu código actual
const crearSolicitud = async () => {
  const datos = {
    email: "usuario@example.com",
    autorizacionTratamientoDatos: true,
    // ... resto de campos
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

// 2. Error en consola
// Error: Failed to fetch
// NetworkError: Failed to fetch

// 3. Respuesta del servidor (si hay)
// { success: false, error: { message: "..." } }

// 4. Status code
// 400, 500, etc.
```

### ❌ Información NO Útil:
```
- "No funciona" (muy vago)
- "Hay un error" (sin detalles)
- "No sé qué pasa" (sin contexto)
```

---

## 🔧 Checklist de Diagnóstico

### Paso 1: Verificar que la API está corriendo
```bash
# En tu terminal
curl http://localhost:3001/
# Debería responder: {"name":"Bancamia DataExpress API",...}
```

### Paso 2: Probar la API directamente
```bash
curl -X POST http://localhost:3001/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Test",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle 123",
    "celularNegocio": "3001234567"
  }'
```

### Paso 3: Verificar en el navegador
1. Abre las DevTools (F12)
2. Ve a la pestaña **Network**
3. Intenta enviar el formulario
4. Busca la petición a `/api/solicitudes`
5. Revisa:
   - **Status**: ¿200, 201, 400, 500?
   - **Request Payload**: ¿Los datos se envían correctamente?
   - **Response**: ¿Qué responde el servidor?

### Paso 4: Verificar la consola
1. Abre las DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo
4. Copia el mensaje completo

---

## 🐛 Errores Comunes y Soluciones

### Error: "Failed to fetch" o "Network Error"
**Causa:** La API no está corriendo o hay problema de CORS
**Solución:**
- Verifica que la API esté corriendo en el puerto correcto
- Verifica la URL (debe ser `http://localhost:3001/api/solicitudes`)
- Verifica que no haya bloqueo de CORS

### Error: "400 Bad Request"
**Causa:** Datos inválidos o faltantes
**Solución:**
- Verifica que todos los campos requeridos estén presentes
- Verifica el formato de los datos (fechas, booleanos)
- Revisa la respuesta del servidor para ver qué campo falta

### Error: "500 Internal Server Error"
**Causa:** Error en el servidor (generación de PDF, Firebase, etc.)
**Solución:**
- Revisa los logs del servidor
- Verifica que Firebase esté configurado correctamente
- Verifica que las variables de entorno estén configuradas

### Error: "CORS policy"
**Causa:** Problema de CORS entre frontend y backend
**Solución:**
- Verifica que la API tenga CORS configurado
- Verifica que la URL del frontend esté permitida

### El PDF no se genera
**Causa:** Error silencioso en la generación
**Solución:**
- Revisa los logs del servidor
- Verifica que el campo `documento` aparezca en la respuesta
- Verifica que Firebase Storage esté configurado

---

## 📤 Template de Información para Compartir

Copia y completa este template:

```markdown
## Error que estoy viendo:
[Describe el error exacto]

## Código que estoy usando:
```javascript
[Pega tu código aquí]
```

## Datos que estoy enviando:
```json
{
  "email": "...",
  ...
}
```

## Respuesta del servidor:
```json
{
  "success": ...,
  "error": ...
}
```

## Status code:
[200, 201, 400, 500, etc.]

## Errores en consola:
[Pega los errores de la consola del navegador]

## Errores en Network:
[Status code y respuesta de la petición]
```

---

## 🎯 Preguntas Rápidas para Diagnosticar

1. **¿El servidor está corriendo?**
   - Prueba: `curl http://localhost:3001/`

2. **¿La petición llega al servidor?**
   - Revisa: Network tab → ¿Se envía la petición?

3. **¿Qué responde el servidor?**
   - Revisa: Network tab → Response

4. **¿Hay errores en la consola?**
   - Revisa: Console tab → Errores en rojo

5. **¿Los datos están bien formateados?**
   - Revisa: Network tab → Request Payload

6. **¿El PDF se genera?**
   - Revisa: Response → `data.documento.url` existe?

---

## 💡 Tips para Obtener Mejor Ayuda

1. **Siempre incluye:**
   - El código exacto que estás usando
   - El error completo (no solo "hay un error")
   - La respuesta del servidor
   - Screenshots si es posible

2. **Prueba primero:**
   - Que la API funcione con curl
   - Que el servidor esté corriendo
   - Que no haya errores de CORS

3. **Revisa:**
   - La consola del navegador
   - La pestaña Network
   - Los logs del servidor

---

**Con esta información podré ayudarte a resolver el problema rápidamente! 🚀**


