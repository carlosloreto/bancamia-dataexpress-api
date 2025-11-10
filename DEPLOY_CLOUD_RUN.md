# 🚀 Guía de Despliegue en Cloud Run

Esta guía te llevará paso a paso para desplegar tu API Express en Cloud Run.

---

## 📋 Pre-requisitos

1. **Cuenta de GCP activa** con Firestore configurado ✅ (Ya lo tienes)
2. **gcloud CLI instalado** ([Descargar aquí](https://cloud.google.com/sdk/docs/install))
3. **Docker instalado** ([Descargar aquí](https://www.docker.com/products/docker-desktop))

---

## 🎯 Paso 1: Configurar gcloud CLI

```bash
# Autenticarte en GCP
gcloud auth login

# Configurar tu proyecto
gcloud config set project bancamia-dataexpress-test

# Habilitar las APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## 🐳 Paso 2: Construir la Imagen Docker (Localmente - Opcional)

```bash
# Probar que Docker funciona correctamente
docker build -t bancamia-dataexpress-api .

# Probar la imagen localmente (opcional)
docker run -p 3000:3000 \
  -e FIREBASE_PROJECT_ID=bancamia-dataexpress-test \
  -e FIREBASE_API_KEY=AIzaSyDM6dgLBJrqzSwdXUiDIFiSybkWVNkSJ4o \
  -e FIREBASE_AUTH_DOMAIN=bancamia-dataexpress-test.firebaseapp.com \
  -e FIREBASE_STORAGE_BUCKET=bancamia-dataexpress-test.firebasestorage.app \
  -e FIREBASE_MESSAGING_SENDER_ID=533748472645 \
  -e FIREBASE_APP_ID=1:533748472645:web:ffebad4f00b8009873fc2c \
  -e FIREBASE_MEASUREMENT_ID=G-E3NKWCQT0X \
  bancamia-dataexpress-api

# Visita: http://localhost:3000/api/v1/health
```

---

## 🚀 Paso 3: Desplegar en Cloud Run (Método Simple)

### Opción A: Despliegue Directo desde Código Fuente

```bash
gcloud run deploy bancamia-dataexpress-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=bancamia-dataexpress-test,FIREBASE_API_KEY=AIzaSyDM6dgLBJrqzSwdXUiDIFiSybkWVNkSJ4o,FIREBASE_AUTH_DOMAIN=bancamia-dataexpress-test.firebaseapp.com,FIREBASE_STORAGE_BUCKET=bancamia-dataexpress-test.firebasestorage.app,FIREBASE_MESSAGING_SENDER_ID=533748472645,FIREBASE_APP_ID=1:533748472645:web:ffebad4f00b8009873fc2c,FIREBASE_MEASUREMENT_ID=G-E3NKWCQT0X"
```

### Opción B: Despliegue con Docker Build Manual

```bash
# 1. Construir y subir la imagen
gcloud builds submit --tag gcr.io/bancamia-dataexpress-test/bancamia-dataexpress-api

# 2. Desplegar la imagen
gcloud run deploy bancamia-dataexpress-api \
  --image gcr.io/bancamia-dataexpress-test/bancamia-dataexpress-api \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=bancamia-dataexpress-test,FIREBASE_API_KEY=AIzaSyDM6dgLBJrqzSwdXUiDIFiSybkWVNkSJ4o,FIREBASE_AUTH_DOMAIN=bancamia-dataexpress-test.firebaseapp.com,FIREBASE_STORAGE_BUCKET=bancamia-dataexpress-test.firebasestorage.app,FIREBASE_MESSAGING_SENDER_ID=533748472645,FIREBASE_APP_ID=1:533748472645:web:ffebad4f00b8009873fc2c,FIREBASE_MEASUREMENT_ID=G-E3NKWCQT0X"
```

---

## ✅ Paso 4: Verificar el Despliegue

Después del despliegue, gcloud te dará una URL como:

```
https://bancamia-dataexpress-api-<hash>.us-central1.run.app
```

Prueba tu API:

```bash
# Health check
curl https://bancamia-dataexpress-api-<hash>.us-central1.run.app/api/v1/health

# Listar usuarios
curl https://bancamia-dataexpress-api-<hash>.us-central1.run.app/api/v1/users
```

---

## 🔒 Paso 5: Configurar Seguridad (MUY IMPORTANTE)

### A. Actualizar Reglas de Firestore

En Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo permitir acceso desde tu Cloud Run
    match /{document=**} {
      allow read, write: if request.auth != null;
      // O más restrictivo según tus necesidades
    }
  }
}
```

### B. Configurar CORS en Cloud Run (si tu frontend está en otro dominio)

Edita `src/app.js` y actualiza:

```javascript
app.use(cors({
  origin: [
    'https://tu-frontend.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

Luego vuelve a desplegar.

---

## 📊 Paso 6: Monitoreo y Logs

```bash
# Ver logs en tiempo real
gcloud run services logs read bancamia-dataexpress-api \
  --region us-central1 \
  --follow

# Ver métricas en GCP Console
# https://console.cloud.google.com/run
```

---

## 🔄 Paso 7: Actualizar la API (Re-despliegue)

Cada vez que hagas cambios en tu código:

```bash
# Opción Simple (recomendada)
gcloud run deploy bancamia-dataexpress-api \
  --source . \
  --region us-central1

# O con Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

---

## 💰 Costos Estimados

**Cloud Run es GRATIS** para:
- 2 millones de solicitudes/mes
- 360,000 GB-segundos de memoria
- 180,000 vCPU-segundos

Para una API pequeña/mediana, probablemente **no pagarás nada** o muy poco (<$5/mes).

---

## 🎛️ Configuración Avanzada

### Variables de Entorno desde Secret Manager (Más Seguro)

```bash
# 1. Crear secreto para Firebase Config
echo -n "AIzaSyDM6dgLBJrqzSwdXUiDIFiSybkWVNkSJ4o" | \
  gcloud secrets create firebase-api-key --data-file=-

# 2. Dar permisos a Cloud Run
gcloud secrets add-iam-policy-binding firebase-api-key \
  --member="serviceAccount:bancamia-dataexpress-test@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. Actualizar Cloud Run para usar el secreto
gcloud run services update bancamia-dataexpress-api \
  --region us-central1 \
  --update-secrets FIREBASE_API_KEY=firebase-api-key:latest
```

### Configurar Dominio Personalizado

```bash
# Mapear tu dominio
gcloud run domain-mappings create \
  --service bancamia-dataexpress-api \
  --domain api.tudominio.com \
  --region us-central1
```

---

## 🐛 Troubleshooting

### Error: "Permission Denied"
```bash
gcloud auth application-default login
```

### Error: "API not enabled"
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Error: "Container failed to start"
- Revisa los logs: `gcloud run services logs read bancamia-dataexpress-api --region us-central1`
- Asegúrate que el puerto 3000 esté expuesto en el Dockerfile
- Verifica que todas las variables de entorno estén configuradas

---

## 📱 Integrar con tu Frontend Next.js

Una vez desplegado, actualiza tu Next.js:

```typescript
// .env.local en Next.js
NEXT_PUBLIC_API_URL=https://bancamia-dataexpress-api-<hash>.us-central1.run.app
```

```typescript
// app/test/page.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL;

fetch(`${API_URL}/api/v1/users`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## ✅ Checklist Final

- [ ] gcloud CLI instalado y configurado
- [ ] Docker instalado (opcional, Cloud Build lo hace por ti)
- [ ] APIs habilitadas en GCP
- [ ] Código desplegado con `gcloud run deploy`
- [ ] Variables de entorno configuradas
- [ ] Reglas de Firestore actualizadas
- [ ] URL de producción probada
- [ ] Frontend apuntando a la nueva URL

---

## 🎉 ¡Listo!

Tu API Express ahora está corriendo en Cloud Run con:
- ✅ Escalado automático
- ✅ HTTPS incluido
- ✅ $0 cuando no hay tráfico
- ✅ Conectado a Firestore
- ✅ Listo para producción

**URL de tu API:** Se te dará después del despliegue

**Siguiente paso:** Ejecuta el comando de la Opción A en el Paso 3 y estarás en producción en ~5 minutos.

