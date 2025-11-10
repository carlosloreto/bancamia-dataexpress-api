# Configuración de Firebase/Firestore

Esta guía te ayudará a configurar Firebase/Firestore para tu API Express.

## 📋 Requisitos Previos

1. Cuenta de Google Cloud Platform (GCP) / Firebase
2. Proyecto de Firebase creado

## 🔧 Configuración Paso a Paso

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o selecciona un proyecto existente
3. Anota el **Project ID** de tu proyecto

### 2. Habilitar Firestore

1. En la consola de Firebase, ve a **Build > Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona el modo:
   - **Modo de producción**: Para aplicaciones en producción
   - **Modo de prueba**: Para desarrollo (permite lectura/escritura por 30 días)
4. Selecciona la ubicación de tu base de datos (ej: `us-central`)

### 3. Obtener Credenciales de Service Account

#### Opción A: Para Producción

1. Ve a **Configuración del proyecto** (ícono de engranaje) > **Cuentas de servicio**
2. Haz clic en "Generar nueva clave privada"
3. Descarga el archivo JSON
4. **IMPORTANTE**: Este archivo contiene credenciales sensibles, NO lo subas a Git

**Opción 1 - Variable de entorno con JSON completo:**

```bash
# En tu archivo .env
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"tu-project-id",...}'
```

**Opción 2 - Ruta al archivo:**

```bash
# En tu archivo .env
FIREBASE_PROJECT_ID=tu-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json
```

#### Opción B: Para Desarrollo Local con Emulador

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia sesión:
```bash
firebase login
```

3. Configura el emulador:
```bash
firebase init emulators
```

4. Selecciona "Firestore Emulator"

5. Inicia el emulador:
```bash
firebase emulators:start
```

6. En tu archivo `.env`:
```bash
FIREBASE_PROJECT_ID=demo-project
FIRESTORE_EMULATOR_HOST=localhost:8080
NODE_ENV=development
```

### 4. Configurar Variables de Entorno

Crea o actualiza tu archivo `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# Logging
LOG_LEVEL=info

# Firebase/Firestore Configuration
FIREBASE_PROJECT_ID=tu-project-id

# Para producción - Opción 1: JSON del Service Account
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"tu-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Para producción - Opción 2: Ruta al archivo (alternativa)
# GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# Para desarrollo - Emulador (opcional)
# FIRESTORE_EMULATOR_HOST=localhost:8080
```

### 5. Configurar Reglas de Seguridad (Producción)

En la consola de Firebase, ve a **Firestore Database > Reglas**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección users
    match /users/{userId} {
      // Permitir lectura y escritura desde el servidor
      // (estas reglas no afectan a Firebase Admin SDK)
      allow read, write: if request.auth != null;
    }
    
    // Por defecto, denegar acceso
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Nota**: Firebase Admin SDK (que usamos en el servidor) **ignora las reglas de seguridad** y tiene acceso completo. Las reglas solo se aplican a clientes web/móvil.

## 🧪 Verificación

Una vez configurado, inicia tu servidor:

```bash
npm start
```

Deberías ver en los logs:

```
[INFO] Firestore inicializado exitosamente
Data: {
  "projectId": "tu-project-id"
}
```

## 📊 Estructura de Datos en Firestore

### Colección: `users`

```javascript
{
  // ID del documento (generado automáticamente)
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "role": "admin",
  "createdAt": Timestamp,
  "updatedAt": Timestamp (opcional)
}
```

## 🔍 Herramientas de Desarrollo

### Firebase Console
- Ver y editar datos: https://console.firebase.google.com/
- Navega a **Firestore Database** para ver tus colecciones

### Firebase Emulator UI
- Si usas el emulador: http://localhost:4000
- Interfaz visual para inspeccionar datos del emulador

## 🚨 Seguridad

### ⚠️ NUNCA subas credenciales a Git

Agrega a tu `.gitignore`:

```gitignore
# Firebase credentials
serviceAccountKey.json
.env
.env.local
config/*.json
```

### ✅ Mejores Prácticas

1. **Producción**: Usa variables de entorno del servidor (Heroku, AWS, GCP, etc.)
2. **Desarrollo**: Usa el emulador de Firestore
3. **CI/CD**: Usa secretos del repositorio (GitHub Secrets, GitLab CI Variables)
4. **Rotación**: Rota las credenciales periódicamente

## 🔗 Enlaces Útiles

- [Documentación de Firestore](https://firebase.google.com/docs/firestore?hl=es-419)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express con Firebase Hosting](https://firebase.google.com/docs/hosting/frameworks/express?hl=es-419)
- [Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)

## 🆘 Solución de Problemas

### Error: "No se encontraron credenciales de Firebase"

**Solución**: Asegúrate de definir `FIREBASE_SERVICE_ACCOUNT` o `GOOGLE_APPLICATION_CREDENTIALS` en tu `.env`

### Error: "Permission denied"

**Solución**: 
1. Verifica que el Service Account tenga los permisos correctos en GCP
2. En desarrollo, asegúrate de usar el emulador o configurar las reglas correctamente

### Error: "ECONNREFUSED localhost:8080"

**Solución**: Si usas el emulador, asegúrate de iniciarlo antes:
```bash
firebase emulators:start
```

## 📝 Ejemplo Rápido para Desarrollo

Para empezar rápidamente en desarrollo sin configurar credenciales:

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Inicializar emuladores
firebase init emulators

# 3. Configurar .env
echo "FIREBASE_PROJECT_ID=demo-project" >> .env
echo "FIRESTORE_EMULATOR_HOST=localhost:8080" >> .env
echo "NODE_ENV=development" >> .env

# 4. Iniciar emulador (en una terminal)
firebase emulators:start

# 5. Iniciar tu API (en otra terminal)
npm start
```


