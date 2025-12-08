# 📋 Pasos para Probar el PDF Paso a Paso

## 🎯 Objetivo
Probar la generación y registro del PDF de forma separada para identificar problemas.

---

## 📝 Paso 1: Borrar todos los registros

Ejecuta el script de limpieza:

```bash
node src/scripts/clear-firestore.js
```

**Qué hace:**
- Elimina TODOS los registros de la colección `solicitudes`
- Elimina TODOS los registros de la colección `users`
- Pide confirmación (escribe "SI" para confirmar)

**Resultado esperado:**
```
✅ Limpieza completada. X documentos eliminados en total
```

---

## 📄 Paso 2: Probar SOLO la generación y subida del PDF

Ejecuta el script de prueba del PDF:

```bash
node src/scripts/test-pdf-only.js
```

**Qué hace:**
- Genera un PDF con datos de prueba
- Sube el PDF a Firebase Storage
- **NO crea ningún registro en Firestore**
- Muestra la información del documento generado

**Resultado esperado:**
```
✅ PDF generado exitosamente
✅ PDF subido exitosamente a Firebase Storage
📋 INFORMACIÓN DEL DOCUMENTO:
   - URL: https://firebasestorage.googleapis.com/...
   - Path: solicitudes/...
   - FileName: solicitud_...
   - OriginalName: solicitud_...
```

**⚠️ IMPORTANTE:** 
- Copia la información completa que muestra (especialmente la URL)
- Verifica que el archivo `test-pdf-only.pdf` se haya creado en la raíz del proyecto
- Si hay algún error, cópialo completo

---

## 🗄️ Paso 3: Probar crear un registro completo

Usa el endpoint de la API para crear una solicitud:

```bash
# Si tienes el servidor corriendo localmente
curl -X POST http://localhost:3001/api/v1/solicitudes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "email": "test@example.com",
    "autorizacionTratamientoDatos": true,
    "autorizacionContacto": true,
    "nombreCompleto": "Juan Pérez",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1990-01-15",
    "fechaExpedicionDocumento": "2020-01-15",
    "ciudadNegocio": "201",
    "direccionNegocio": "Calle Test 123",
    "celularNegocio": "3001234567"
  }'
```

**O usa Postman/Insomnia** con:
- **URL:** `POST /api/v1/solicitudes`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer TU_TOKEN` (si es necesario)
- **Body:** JSON con los datos de arriba

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Solicitud de crédito creada exitosamente",
  "data": {
    "id": "abc123...",
    "email": "test@example.com",
    "documento": {
      "url": "https://firebasestorage.googleapis.com/...",
      "path": "solicitudes/...",
      "fileName": "solicitud_...",
      "originalName": "solicitud_..."
    },
    ...
  }
}
```

**⚠️ IMPORTANTE:**
- Verifica que el campo `documento` esté presente en la respuesta
- Verifica que `documento.url` no esté vacío
- Si el campo `documento` NO aparece o está vacío, copia la respuesta completa

---

## 🔍 Paso 4: Verificar en Firestore

1. Ve a Firebase Console
2. Ve a Firestore Database
3. Busca la colección `solicitudes`
4. Abre el registro que acabas de crear
5. Verifica que tenga el campo `documento` con:
   - `url`
   - `path`
   - `fileName`
   - `originalName`

**Si el campo `documento` NO está:**
- El problema está en el guardado en Firestore
- Revisa los logs del servidor para ver errores

**Si el campo `documento` está pero está vacío o sin URL:**
- El problema está en la generación/subida del PDF
- Revisa los logs del servidor

---

## 📊 Qué reportar después de las pruebas

Cuando termines las pruebas, comparte:

1. **Resultado del Paso 2 (test-pdf-only.js):**
   - ¿Se generó el PDF? ✅/❌
   - ¿Se subió a Storage? ✅/❌
   - ¿Qué información mostró? (copia completa)

2. **Resultado del Paso 3 (crear registro):**
   - ¿Se creó el registro? ✅/❌
   - ¿Aparece el campo `documento` en la respuesta? ✅/❌
   - ¿Qué contiene el campo `documento`? (copia completa)
   - ¿Hay algún error? (copia completo)

3. **Logs del servidor:**
   - Copia los logs relevantes cuando creaste el registro
   - Busca mensajes como:
     - "Generando PDF de la solicitud"
     - "PDF generado exitosamente"
     - "PDF subido exitosamente"
     - "Documento agregado a solicitudData"
     - "Solicitud creada, verificando documento"

4. **Verificación en Firestore:**
   - ¿El campo `documento` está en Firestore? ✅/❌
   - ¿Qué contiene? (screenshot o descripción)

---

## 🚀 Comandos rápidos

```bash
# 1. Limpiar base de datos
node src/scripts/clear-firestore.js

# 2. Probar solo PDF
node src/scripts/test-pdf-only.js

# 3. Verificar logs del servidor (si está corriendo)
# Los logs aparecerán en la consola donde ejecutaste el servidor
```

---

## ❓ Preguntas frecuentes

**P: ¿Necesito tener el servidor corriendo para el Paso 2?**
R: No, el script `test-pdf-only.js` funciona independientemente.

**P: ¿Necesito autenticación para el Paso 2?**
R: No, solo necesitas las variables de entorno de Firebase configuradas.

**P: ¿Qué pasa si el Paso 2 falla?**
R: El problema está en la generación o subida del PDF, no en el guardado en Firestore.

**P: ¿Qué pasa si el Paso 2 funciona pero el Paso 3 no guarda el documento?**
R: El problema está en cómo se pasa o guarda el documento en el servicio de solicitudes.

