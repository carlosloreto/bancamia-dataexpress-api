# Bancamia DataExpress API

API RESTful construida con Express.js y Cloud Firestore para el proyecto Bancamia DataExpress.

## 🚀 Características

- ✅ **Express.js** - Framework web rápido y minimalista
- ✅ **Cloud Firestore** - Base de datos NoSQL escalable de Firebase/GCP
- ✅ **Firebase Admin SDK** - Integración completa con Firebase
- ✅ **ES Modules** - Sintaxis moderna de JavaScript
- ✅ **Sistema de logging centralizado** - Trazabilidad completa
- ✅ **Manejo de errores robusto** - Errores personalizados y middleware global
- ✅ **Seguridad** - Helmet, CORS, validaciones
- ✅ **Estructura modular** - Código organizado y escalable
- ✅ **Health checks** - Monitoreo del estado de la aplicación
- ✅ **Compresión** - Respuestas comprimidas para mejor rendimiento
- ✅ **Scripts de inicialización** - Seed y limpieza de datos

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Proyecto de Firebase/GCP con Firestore habilitado
- Credenciales de Firebase (Service Account o emulador local)

## 🛠️ Instalación

1. **Clonar el repositorio o navegar al directorio**

```bash
cd bancamia_dataexpress_api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase/Firestore**

⚠️ **IMPORTANTE**: Antes de continuar, necesitas configurar Firebase. Consulta la guía detallada:

📖 **[Ver FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** para instrucciones completas

**Opción A - Desarrollo Rápido con Emulador (Recomendado):**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar emuladores
firebase init emulators

# Crear archivo .env
echo "FIREBASE_PROJECT_ID=demo-project" >> .env
echo "FIRESTORE_EMULATOR_HOST=localhost:8080" >> .env
echo "NODE_ENV=development" >> .env
```

**Opción B - Producción con Credenciales Reales:**

Crear un archivo `.env` con tus credenciales de Firebase:

```env
PORT=3000
NODE_ENV=production
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info

# Firebase Configuration
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

4. **Inicializar datos (opcional)**

Poblar Firestore con datos de ejemplo:

```bash
npm run seed
```

## 🚦 Uso

### Modo Desarrollo con Emulador

**Terminal 1 - Iniciar Firestore Emulator:**
```bash
firebase emulators:start
```

**Terminal 2 - Iniciar API:**
```bash
npm run dev
```

El servidor se iniciará con auto-reload en `http://localhost:3000`

### Modo Producción

```bash
npm start
```

### Scripts Disponibles

```bash
npm start          # Iniciar servidor en modo producción
npm run dev        # Iniciar servidor con auto-reload
npm run seed       # Poblar Firestore con datos de ejemplo
npm run seed:force # Forzar seed (elimina datos existentes)
npm run clear      # Limpiar todos los datos de Firestore (con confirmación)
npm run clear:force # Limpiar sin confirmación
```

## 📁 Estructura del Proyecto

```
bancamia_dataexpress_api/
├── src/
│   ├── config/            # Configuración de la aplicación
│   │   └── index.js
│   ├── controllers/       # Controladores (lógica de rutas)
│   │   └── users.controller.js
│   ├── lib/               # Librerías compartidas
│   │   ├── errors.js      # Sistema de errores personalizado
│   │   ├── firestore.js   # Módulo centralizado de Firestore ⭐
│   │   └── logger.js      # Sistema de logging
│   ├── middleware/        # Middlewares personalizados
│   │   └── index.js
│   ├── routes/            # Definición de rutas
│   │   ├── index.js
│   │   └── users.routes.js
│   ├── scripts/           # Scripts de utilidad
│   │   ├── seed-firestore.js   # Poblar datos iniciales
│   │   └── clear-firestore.js  # Limpiar datos
│   ├── services/          # Lógica de negocio y acceso a Firestore
│   │   └── users.service.js
│   ├── app.js             # Configuración de Express
│   └── index.js           # Punto de entrada
├── .gitignore
├── API_EXAMPLES.md        # Ejemplos de uso de la API
├── FIREBASE_SETUP.md      # Guía de configuración de Firebase ⭐
├── package.json
└── README.md
```

## 🔌 Endpoints de la API

### Health Check

```http
GET /health
```

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2024-11-01T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### API Base

```http
GET /api/v1/
```

### Usuarios

#### Obtener todos los usuarios

```http
GET /api/v1/users?page=1&limit=10&search=juan
```

**Query Params:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 10)
- `search` (opcional): Buscar por nombre o email

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Juan Pérez",
      "email": "juan.perez@example.com",
      "role": "admin",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

#### Obtener un usuario por ID

```http
GET /api/v1/users/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### Crear un nuevo usuario

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "Nuevo Usuario",
  "email": "nuevo@example.com",
  "role": "user"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "4",
    "name": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "role": "user",
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

#### Actualizar un usuario

```http
PUT /api/v1/users/:id
Content-Type: application/json

{
  "name": "Nombre Actualizado",
  "email": "actualizado@example.com"
}
```

#### Eliminar un usuario

```http
DELETE /api/v1/users/:id
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

## ⚠️ Manejo de Errores

La API utiliza un sistema de errores centralizado con códigos de error consistentes:

### Errores de Validación (400)

```json
{
  "error": {
    "message": "Los campos name y email son requeridos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "fields": ["name", "email"]
    }
  }
}
```

### Errores de Autenticación (401)

```json
{
  "error": {
    "message": "No autorizado",
    "code": "AUTHENTICATION_ERROR",
    "statusCode": 401
  }
}
```

### Errores de Recurso No Encontrado (404)

```json
{
  "error": {
    "message": "Usuario con ID 999 no encontrado",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

### Errores de Conflicto (409)

```json
{
  "error": {
    "message": "El email ya está registrado",
    "code": "CONFLICT_ERROR",
    "statusCode": 409,
    "details": {
      "field": "email",
      "value": "duplicate@example.com"
    }
  }
}
```

### Errores del Servidor (500)

```json
{
  "error": {
    "message": "Error interno del servidor",
    "code": "INTERNAL_ERROR",
    "statusCode": 500
  }
}
```

## 📝 Logging

La aplicación utiliza un sistema de logging centralizado con diferentes niveles:

- **ERROR**: Errores críticos
- **WARN**: Advertencias y situaciones que requieren atención
- **INFO**: Eventos importantes de la aplicación
- **DEBUG**: Información detallada para depuración

Configurar el nivel de logging en `.env`:

```env
LOG_LEVEL=info  # error | warn | info | debug
```

## 🔒 Seguridad

La API implementa varias capas de seguridad:

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de recursos de origen cruzado
- **Validación de Content-Type**: Para peticiones POST/PUT/PATCH
- **Límite de tamaño de payload**: 10MB máximo
- **Compresión**: Respuestas comprimidas

## 🔥 Firestore

La aplicación utiliza **Cloud Firestore** como base de datos. Todas las operaciones de base de datos se realizan a través del módulo centralizado en `src/lib/firestore.js`.

### Estructura de Datos

#### Colección: `users`

```javascript
{
  id: "auto-generated-id",
  name: "Juan Pérez",
  email: "juan.perez@example.com",
  role: "admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Operaciones Básicas

```javascript
// Importar módulo centralizado
import { collection, doc, docToObject } from '../lib/firestore.js';

// Obtener todos los usuarios
const snapshot = await collection('users').get();

// Obtener un usuario específico
const userDoc = await doc('users', 'user-id').get();

// Crear un usuario
await collection('users').doc().set({
  name: 'Nuevo Usuario',
  email: 'nuevo@example.com'
});
```

Para más información, consulta [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🧪 Testing

Para agregar tests con Firestore, instala Jest y configure el emulador:

```bash
npm install --save-dev jest supertest
```

En tus tests, configura el emulador:

```javascript
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
```

## 🚢 Despliegue

### Variables de Entorno en Producción

Asegúrate de configurar:

```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=warn
```

### Recomendaciones

1. Usar un gestor de procesos como **PM2**:
```bash
npm install -g pm2
pm2 start src/index.js --name bancamia-api
```

2. **Configurar Firebase en producción** con credenciales seguras
3. Configurar un reverse proxy con **Nginx**
4. Implementar rate limiting con **express-rate-limit**
5. Agregar autenticación con **Firebase Authentication**
6. Configurar backups automáticos de Firestore
7. Implementar índices compuestos según tus consultas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👤 Autor

Bancamia Team

## 🔗 Enlaces Útiles

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Firestore](https://firebase.google.com/docs/firestore?hl=es-419)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express con Firebase Hosting](https://firebase.google.com/docs/hosting/frameworks/express?hl=es-419)
- [Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [RESTful API Best Practices](https://restfulapi.net/)

---

**¡Listo para usar!** 🎉

Para inicio rápido con emulador:
```bash
# 1. Instalar dependencias
npm install

# 2. Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# 3. Configurar .env para desarrollo
echo "FIREBASE_PROJECT_ID=demo-project" > .env
echo "FIRESTORE_EMULATOR_HOST=localhost:8080" >> .env
echo "NODE_ENV=development" >> .env

# 4. Iniciar emulador (Terminal 1)
firebase emulators:start

# 5. Iniciar API (Terminal 2)
npm run dev

# 6. Poblar con datos de ejemplo
npm run seed
```

Visita: `http://localhost:3000`

