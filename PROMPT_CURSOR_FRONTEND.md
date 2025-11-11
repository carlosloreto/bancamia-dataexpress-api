# 🤖 Prompt Simplificado para Cursor - Next.js con React

Copia y pega este prompt en Cursor para implementar la autenticación.

---

## 📋 Prompt para Cursor

```
Necesito conectar mi aplicación Next.js con React a una API que usa Firebase Authentication.

RUTAS DE LA API (base URL: [TU_URL_API]):
1. POST /api/v1/auth/login
   - Body: { "idToken": "token_de_firebase" }
   - Retorna: { "success": true, "data": { "user": {...}, "token": "..." } }

2. POST /api/v1/auth/register  
   - Body: { "email": "...", "password": "...", "name": "..." }
   - Retorna: { "success": true, "data": { "user": {...} } }

3. GET /api/v1/auth/me
   - Header: Authorization: Bearer <token>
   - Retorna: { "success": true, "data": { "user": {...} } }

QUÉ DEBO HACER:

1. Configurar Firebase:
   - Variables de entorno en .env.local: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_API_BASE_URL
   - Crear archivo lib/firebase.js para inicializar Firebase Auth
   - Usar process.env.NEXT_PUBLIC_* para acceder a las variables

2. Para LOGIN:
   - Usuario ingresa email/password
   - Autenticar con Firebase Auth (signInWithEmailAndPassword)
   - Obtener idToken (user.getIdToken())
   - Enviar idToken a POST /api/v1/auth/login
   - Guardar token en localStorage o cookies
   - Guardar datos del usuario

3. Para REGISTRO:
   - Usuario ingresa email/password/name
   - Crear usuario en Firebase Auth (createUserWithEmailAndPassword)
   - Obtener idToken
   - Enviar a POST /api/v1/auth/register con { idToken, email, name }
   - Guardar token y usuario

4. Para PETICIONES PROTEGIDAS:
   - Agregar header: Authorization: Bearer <token>
   - Usar axios interceptor o fetch con headers para agregar token automáticamente

5. Crear:
   - Context API (contexts/AuthContext.jsx) con funciones login(), register(), logout()
   - Página o componente de Login
   - Página o componente de Register
   - Middleware o componente para proteger rutas en Next.js

Implementa esto en Next.js con React hooks (useState, useEffect, useContext) y axios o fetch.
```

---

## 📝 Cómo Usar

1. **Copia el prompt de arriba**
2. **Reemplaza `[TU_URL_API]`** con tu URL real (ej: `https://tu-api.cloud.run.app`)
3. **Pégalo en Cursor**
4. **Cursor generará el código automáticamente**

---

## 🔑 Variables Necesarias

Antes de usar, configura estas variables de entorno en tu `.env.local` (Next.js):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_API_BASE_URL=https://tu-api.cloud.run.app
```

**Nota:** En Next.js, las variables que se usan en el cliente deben tener el prefijo `NEXT_PUBLIC_`

---

## ✅ Resumen Rápido

**Rutas a usar:**
- `POST /api/v1/auth/login` - Para login
- `POST /api/v1/auth/register` - Para registro
- `GET /api/v1/auth/me` - Para obtener perfil (requiere token)

**Flujo:**
1. Usuario → Firebase Auth → idToken
2. idToken → API backend → Token + Usuario
3. Guardar token → Usar en peticiones protegidas

