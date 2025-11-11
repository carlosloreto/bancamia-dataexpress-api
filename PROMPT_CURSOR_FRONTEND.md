# 🤖 Prompt para Cursor - Integración de Autenticación Frontend React

Copia y pega este prompt en Cursor para que te ayude a implementar la autenticación en tu proyecto frontend React.

---

## 📋 Prompt Completo

```
Necesito implementar la autenticación en mi aplicación frontend React para conectarla con la API de Bancamia DataExpress que usa Firebase Authentication.

CONTEXTO DE LA API:
- La API está en: [TU_URL_API] (ej: https://tu-api.cloud.run.app)
- Endpoints disponibles:
  - POST /api/v1/auth/login - Login con idToken de Firebase
  - POST /api/v1/auth/register - Registro de nuevo usuario
  - POST /api/v1/auth/verify - Verificar token
  - GET /api/v1/auth/me - Obtener perfil (requiere Authorization: Bearer token)
  - POST /api/v1/auth/refresh - Renovar token

FLUJO DE AUTENTICACIÓN:
1. Usuario ingresa email/password en el frontend
2. Frontend autentica con Firebase Auth (obtiene idToken)
3. Frontend envía idToken a POST /api/v1/auth/login
4. Backend retorna { success: true, data: { user: {...}, token: "..." } }
5. Frontend guarda token y lo usa en header Authorization: Bearer <token> para peticiones protegidas

REQUISITOS:
1. Configurar Firebase en el frontend con estas variables de entorno:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_API_BASE_URL

2. Crear servicio de autenticación que:
   - Use Firebase Auth para login/registro
   - Obtenga idToken de Firebase
   - Envíe idToken a la API backend
   - Maneje respuestas y errores
   - Guarde token en localStorage
   - Implemente interceptores de axios para agregar token automáticamente

3. Crear Context API de React (AuthContext) que:
   - Maneje estado del usuario autenticado con useState
   - Proporcione funciones login(), register(), logout()
   - Use useEffect para observar cambios en Firebase Auth
   - Sincronice con el backend cuando sea necesario
   - Exporte hook useAuth() para usar en componentes

4. Crear componentes React:
   - Login.jsx: formulario con email/password usando useState
   - Register.jsx: formulario de registro con validación
   - ProtectedRoute.jsx: componente que protege rutas usando Navigate de react-router-dom
   - Manejo de errores con mensajes claros

5. Implementar:
   - Validación de formularios
   - Estados de carga
   - Manejo de errores (401, 500, etc.)
   - Renovación automática de tokens
   - Logout y limpieza de datos

MEJORES PRÁCTICAS A SEGUIR:
- Usar variables de entorno para configuración sensible
- Implementar manejo de errores robusto
- Mostrar estados de carga apropiados
- Validar inputs del usuario
- Usar TypeScript si es posible (tipos para user, auth, etc.)
- Seguir patrones de diseño consistentes
- Documentar código importante

ESTRUCTURA DE ARCHIVOS SUGERIDA:
src/
  config/
    firebase.js
  services/
    api.js
    auth.service.js
  contexts/
    AuthContext.jsx
  components/
    Login.jsx
    Register.jsx
    ProtectedRoute.jsx
  utils/
    errorHandler.js

TECNOLOGÍAS A USAR:
- React (hooks: useState, useEffect, useContext)
- React Router DOM para navegación
- Firebase Auth SDK
- Axios para peticiones HTTP
- Context API para estado global de autenticación

Por favor, implementa la solución completa siguiendo estas especificaciones y las mejores prácticas de React.
```

---

## 🎯 Prompt Simplificado (Versión Corta)

```
Implementa autenticación en mi frontend React conectándolo a una API que usa Firebase Auth.

La API espera:
- POST /api/v1/auth/login con { idToken: "token_de_firebase" }
- Retorna { success: true, data: { user: {...}, token: "..." } }
- Peticiones protegidas usan header: Authorization: Bearer <token>

Necesito:
1. Configurar Firebase con variables de entorno
2. Servicio de auth que autentique con Firebase y luego llame a la API
3. Contexto/hook para manejar estado de autenticación
4. Componentes Login, Register, ProtectedRoute
5. Manejo de errores y estados de carga

Sigue mejores prácticas y documenta el código.
```

---

## 🔧 Prompt Específico para React con React Router

```
Necesito implementar autenticación en React usando Firebase Auth y conectándolo a mi API backend.

Configuración necesaria:
- Firebase config con variables de entorno (VITE_FIREBASE_API_KEY, etc.)
- Servicio de API con axios que agregue token automáticamente mediante interceptores
- Servicio de auth que use Firebase Auth y luego llame a POST /api/v1/auth/login
- Context API (AuthContext) para manejar estado de autenticación global
- Hook personalizado useAuth() para acceder al contexto
- Componentes Login.jsx y Register.jsx con validación usando useState
- ProtectedRoute.jsx para proteger rutas usando Navigate de react-router-dom
- Manejo de errores y renovación automática de tokens
- Integración con React Router para navegación

La API está en [TU_URL] y espera idToken de Firebase en el body del login.

Usa React hooks (useState, useEffect, useContext) y sigue las mejores prácticas de React.
```

---

## 📝 Instrucciones de Uso

1. **Copia el prompt completo** o el simplificado
2. **Reemplaza `[TU_URL_API]`** con la URL real de tu API
3. **Abre Cursor** y pega el prompt
4. **Cursor generará** el código necesario siguiendo las especificaciones para React
5. **Revisa y ajusta** según tus necesidades específicas

---

## 🔍 Variables a Personalizar

Antes de usar el prompt, personaliza estas variables:

- `[TU_URL_API]`: URL de tu API (ej: `https://bancamia-api.cloud.run.app`)
- Estructura de carpetas: Ajusta según tu proyecto React
- Estilos: Indica si usas Tailwind CSS, Material-UI, Chakra UI, etc.
- Router: Confirma si usas React Router DOM v6 o v5

---

## ✅ Checklist Post-Implementación

Después de que Cursor genere el código, verifica:

- [ ] Variables de entorno configuradas correctamente
- [ ] Firebase inicializado correctamente
- [ ] Servicio de API funciona y agrega tokens
- [ ] Login funciona end-to-end
- [ ] Register funciona end-to-end
- [ ] Rutas protegidas funcionan
- [ ] Manejo de errores funciona
- [ ] Logout limpia datos correctamente
- [ ] Tokens se renuevan automáticamente
- [ ] Validación de formularios funciona

---

**Nota:** Este prompt está diseñado para trabajar con la API de Bancamia DataExpress. Ajusta según tus necesidades específicas.

