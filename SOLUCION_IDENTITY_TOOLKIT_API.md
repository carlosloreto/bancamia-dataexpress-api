# 🔧 Solución: Error "Identity Toolkit API has not been used"

Este error ocurre cuando la API de Identity Toolkit (Firebase Authentication) no está habilitada en tu proyecto de Google Cloud.

---

## 🚨 Error Común

```json
{
  "error": {
    "message": "Error al registrar usuario",
    "code": "DATABASE_ERROR",
    "statusCode": 500,
    "details": {
      "originalError": "Identity Toolkit API has not been used in project XXXXXX before or it is disabled"
    }
  }
}
```

---

## ✅ Solución Paso a Paso

### Método 1: Habilitar API desde el Enlace del Error (Más Rápido)

1. **Copia el enlace del error**:
   ```
   https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=848620556467
   ```

2. **Abre el enlace en tu navegador**

3. **Click en "HABILITAR" o "ENABLE"**

4. **Espera 2-5 minutos** para que los cambios se propaguen

5. **Vuelve a intentar** tu petición de registro

---

### Método 2: Habilitar desde Google Cloud Console

1. **Ve a Google Cloud Console**:
   ```
   https://console.cloud.google.com/
   ```

2. **Selecciona tu proyecto** (848620556467)

3. **Ve a "APIs & Services" → "Library"**:
   - Menú lateral → "APIs & Services" → "Library"

4. **Busca "Identity Toolkit API"**:
   - En el buscador, escribe: `Identity Toolkit API`

5. **Habilita la API**:
   - Click en "Identity Toolkit API"
   - Click en el botón **"ENABLE"** o **"HABILITAR"**

6. **Espera 2-5 minutos**

7. **Vuelve a intentar** tu petición

---

### Método 3: Habilitar desde Firebase Console

1. **Ve a Firebase Console**:
   ```
   https://console.firebase.google.com/
   ```

2. **Selecciona tu proyecto**

3. **Ve a "Authentication"**:
   - Menú lateral → "Authentication"

4. **Si es la primera vez**, Firebase te pedirá habilitar Authentication:
   - Click en **"Get Started"** o **"Comenzar"**
   - Esto habilitará automáticamente la API de Identity Toolkit

5. **Espera unos minutos**

6. **Vuelve a intentar** tu petición

---

## 🔍 Verificar que la API Está Habilitada

### Opción 1: Desde Google Cloud Console

1. Ve a: `https://console.cloud.google.com/apis/library`
2. Busca "Identity Toolkit API"
3. Debe aparecer como **"ENABLED"** o **"HABILITADA"**

### Opción 2: Desde la URL Directa

Visita esta URL reemplazando `TU_PROJECT_ID` con tu Project ID:
```
https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=TU_PROJECT_ID
```

Si está habilitada, verás un botón "MANAGE" en lugar de "ENABLE".

---

## 📋 APIs Necesarias para Firebase Authentication

Asegúrate de tener habilitadas estas APIs:

1. ✅ **Identity Toolkit API** (Principal - la que está causando el error)
2. ✅ **Firebase Authentication API** (si está disponible)
3. ✅ **Cloud Firestore API** (para la base de datos)

### Habilitar Todas las APIs Necesarias

Puedes habilitarlas todas desde aquí:
```
https://console.cloud.google.com/apis/library
```

Busca y habilita:
- `Identity Toolkit API`
- `Cloud Firestore API`
- `Firebase Authentication API` (si existe)

---

## ⏱️ Tiempo de Propagación

Después de habilitar la API:
- ⏰ **Espera 2-5 minutos** para que los cambios se propaguen
- 🔄 Si después de 5 minutos sigue fallando, espera hasta **10 minutos**
- 🔁 Intenta de nuevo después del tiempo de espera

---

## 🐛 Si el Error Persiste

### 1. Verifica Permisos de la Cuenta de Servicio

Asegúrate de que tu cuenta de servicio tenga los permisos necesarios:

1. Ve a: `https://console.cloud.google.com/iam-admin/iam`
2. Busca tu cuenta de servicio (la que usas para Firebase Admin SDK)
3. Verifica que tenga el rol: **"Firebase Admin SDK Administrator Service Agent"** o **"Editor"**

### 2. Verifica el Project ID

Asegúrate de que el `FIREBASE_PROJECT_ID` en tu `.env` o variables de entorno sea correcto:

```env
FIREBASE_PROJECT_ID=848620556467
```

### 3. Verifica las Credenciales

Asegúrate de que las credenciales de Firebase estén configuradas correctamente:

```env
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu/service-account-key.json
```

O si usas ADC (Application Default Credentials), verifica que estén configuradas.

### 4. Reinicia el Servidor

Después de habilitar la API:
1. Detén tu servidor
2. Espera 2-3 minutos
3. Reinicia el servidor
4. Intenta de nuevo

---

## 📝 Comando Rápido para Habilitar API (gcloud CLI)

Si tienes `gcloud` CLI instalado, puedes habilitar la API desde la terminal:

```bash
gcloud services enable identitytoolkit.googleapis.com --project=848620556467
```

Para verificar:
```bash
gcloud services list --enabled --project=848620556467 | grep identitytoolkit
```

---

## ✅ Checklist de Solución

- [ ] Habilitar Identity Toolkit API desde el enlace del error
- [ ] Esperar 2-5 minutos para propagación
- [ ] Verificar que la API esté habilitada en Google Cloud Console
- [ ] Verificar que Firebase Authentication esté habilitado en Firebase Console
- [ ] Verificar permisos de la cuenta de servicio
- [ ] Verificar que FIREBASE_PROJECT_ID sea correcto
- [ ] Reiniciar el servidor (si es necesario)
- [ ] Intentar registro nuevamente

---

## 🔗 Enlaces Útiles

- **Habilitar Identity Toolkit API**: 
  ```
  https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=848620556467
  ```

- **Google Cloud Console APIs**:
  ```
  https://console.cloud.google.com/apis/library
  ```

- **Firebase Console**:
  ```
  https://console.firebase.google.com/
  ```

- **Documentación de Identity Toolkit API**:
  ```
  https://cloud.google.com/identity-platform/docs/reference/rest
  ```

---

## 💡 Prevención Futura

Para evitar este error en el futuro:

1. **Habilita todas las APIs necesarias** al configurar el proyecto por primera vez
2. **Usa Firebase Console** para configurar Authentication, esto habilita automáticamente las APIs necesarias
3. **Verifica las APIs habilitadas** antes de desplegar a producción

---

## 🆘 Si Nada Funciona

1. **Verifica que estés usando el Project ID correcto**
2. **Verifica que tengas permisos de administrador** en el proyecto
3. **Contacta al administrador del proyecto** para que habilite la API
4. **Revisa los logs de Google Cloud** para más detalles:
   ```
   https://console.cloud.google.com/logs
   ```

---

**Última actualización:** 2024

