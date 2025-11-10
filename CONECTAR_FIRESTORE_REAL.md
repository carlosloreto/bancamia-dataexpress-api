# 🔥 Conectar con tu Firestore Real

Tu Project ID: **`bancamia-dataexpress-test`**

## 🚀 Opción 1: gcloud CLI (MÁS RÁPIDA)

### Paso 1: Instalar Google Cloud SDK

Si no lo tienes instalado:
- Windows: https://cloud.google.com/sdk/docs/install#windows
- Descarga e instala el instalador

### Paso 2: Autenticarte

```bash
gcloud auth application-default login
```

Esto abrirá tu navegador para autenticarte.

### Paso 3: Configurar proyecto

```bash
gcloud config set project bancamia-dataexpress-test
```

### Paso 4: Actualizar `.env`

Abre tu archivo `.env` y modifícalo así:

```env
FIREBASE_PROJECT_ID=bancamia-dataexpress-test
# FIRESTORE_EMULATOR_HOST=localhost:8080  <- COMENTAR ESTA LÍNEA
NODE_ENV=production
PORT=3000
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info
```

### Paso 5: Iniciar tu API

```bash
npm start
```

✅ **¡Listo!** Tu API ahora está conectada a tu Firestore real.

---

## 📄 Opción 2: Service Account JSON

### Paso 1: Descargar credenciales

1. Ve a Firebase Console:
   https://console.firebase.google.com/project/bancamia-dataexpress-test/settings/serviceaccounts/adminsdk

2. Clic en **"Generar nueva clave privada"**

3. Se descargará un archivo JSON

### Paso 2: Guardar el archivo

```bash
# Crear carpeta config si no existe
mkdir config

# Copiar el archivo descargado a:
# config/serviceAccountKey.json
```

### Paso 3: Actualizar `.env`

```env
FIREBASE_PROJECT_ID=bancamia-dataexpress-test
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json
NODE_ENV=production
PORT=3000
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info
```

**⚠️ IMPORTANTE**: Asegúrate de que `config/serviceAccountKey.json` esté en `.gitignore` (ya está configurado).

### Paso 4: Iniciar tu API

```bash
npm start
```

---

## 🧪 Probar la Conexión

Una vez configurado, inicia tu API:

```bash
npm start
```

Deberías ver en los logs:

```
[INFO] Firestore inicializado exitosamente
Data: {
  "projectId": "bancamia-dataexpress-test"
}
```

Luego prueba:

```bash
# Health check
curl http://localhost:3000/health

# Poblar datos (opcional)
npm run seed

# Ver usuarios
curl http://localhost:3000/api/v1/users
```

---

## 🔍 Verificar en Firebase Console

Después de ejecutar `npm run seed`, verifica los datos:

https://console.firebase.google.com/project/bancamia-dataexpress-test/firestore

Deberías ver la colección `users` con los datos.

---

## ❓ Solución de Problemas

### Error: "No se encontraron credenciales"

**Solución Opción 1**: Ejecuta nuevamente `gcloud auth application-default login`

**Solución Opción 2**: Verifica que la ruta del archivo JSON sea correcta

### Error: "Permission denied"

Ve a:
https://console.cloud.google.com/iam-admin/serviceaccounts?project=bancamia-dataexpress-test

Asegúrate de que la cuenta de servicio tenga el rol **"Cloud Datastore User"**

---

## 🎯 Recomendación

Para empezar rápidamente: **Usa la Opción 1 (gcloud CLI)**

Es más segura y no requiere manejar archivos JSON.


