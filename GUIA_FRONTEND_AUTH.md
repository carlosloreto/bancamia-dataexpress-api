# 🔐 Guía de Integración de Autenticación - Frontend React

Esta guía te ayudará a integrar la autenticación de Firebase con la API de Bancamia DataExpress en tu aplicación frontend React.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Firebase en el Frontend](#configuración-de-firebase-en-el-frontend)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Implementación Paso a Paso](#implementación-paso-a-paso)
5. [Manejo de Errores](#manejo-de-errores)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Ejemplos de Código](#ejemplos-de-código)

---

## 🔧 Requisitos Previos

### 1. Configuración de Firebase

Asegúrate de tener:
- ✅ Proyecto Firebase creado
- ✅ Firebase Authentication habilitado (método Email/Password)
- ✅ Configuración de Firebase para web (API Key, Auth Domain, Project ID)
- ✅ URL de la API backend (ej: `https://tu-api.cloud.run.app`)

### 2. Instalación de Dependencias

```bash
npm install firebase axios
# o
yarn add firebase axios
```

---

## ⚙️ Configuración de Firebase en el Frontend

### 1. Crear archivo de configuración de Firebase

Crea un archivo `src/config/firebase.js` (o similar):

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN", // ej: bancamia-dataexpress-test1.firebaseapp.com
  projectId: "TU_PROJECT_ID", // ej: bancamia-dataexpress-test1
  // ... otras configuraciones si las necesitas
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

export default app;
```

### 2. Variables de Entorno (Recomendado)

Crea un archivo `.env` en la raíz de tu proyecto frontend:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-auth-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_API_BASE_URL=https://tu-api.cloud.run.app
```

Y actualiza tu configuración:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
```

---

## 🔄 Flujo de Autenticación

### Diagrama del Flujo

```
1. Usuario ingresa email/password
   ↓
2. Frontend autentica con Firebase Auth
   ↓
3. Firebase Auth retorna idToken
   ↓
4. Frontend envía idToken a /api/v1/auth/login
   ↓
5. Backend verifica token y sincroniza con Firestore
   ↓
6. Backend retorna datos del usuario + token
   ↓
7. Frontend guarda token y datos del usuario
   ↓
8. Frontend usa token en peticiones protegidas
```

### Endpoints de la API

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Login con idToken de Firebase | No |
| POST | `/api/v1/auth/register` | Registro de nuevo usuario | No |
| POST | `/api/v1/auth/verify` | Verificar token | No |
| GET | `/api/v1/auth/me` | Obtener perfil del usuario | Sí |
| POST | `/api/v1/auth/refresh` | Renovar token | No |

---

## 🚀 Implementación Paso a Paso

### Paso 1: Crear servicio de API

Crea `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Crear instancia de axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Paso 2: Crear servicio de autenticación

Crea `src/services/auth.service.js`:

```javascript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

/**
 * Login con email y password
 */
export const login = async (email, password) => {
  try {
    // 1. Autenticar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // 2. Enviar token a la API backend
    const response = await api.post('/auth/login', { idToken });

    // 3. Guardar token y datos del usuario
    const { user, token } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      user,
      token
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw handleAuthError(error);
  }
};

/**
 * Registro de nuevo usuario
 */
export const register = async (email, password, name) => {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // 2. Registrar en la API backend
    const response = await api.post('/auth/register', {
      idToken,
      email,
      name
    });

    // 3. Guardar token y datos del usuario
    const { user } = response.data.data;
    localStorage.setItem('authToken', idToken);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw handleAuthError(error);
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    // Cerrar sesión en Firebase
    await firebaseSignOut(auth);
    
    // Limpiar almacenamiento local
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Obtener usuario del almacenamiento local
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Observar cambios en el estado de autenticación de Firebase
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Manejar errores de autenticación
 */
const handleAuthError = (error) => {
  // Errores de Firebase Auth
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('Usuario no encontrado');
      case 'auth/wrong-password':
        return new Error('Contraseña incorrecta');
      case 'auth/email-already-in-use':
        return new Error('El email ya está registrado');
      case 'auth/weak-password':
        return new Error('La contraseña es muy débil');
      case 'auth/invalid-email':
        return new Error('Email inválido');
      case 'auth/network-request-failed':
        return new Error('Error de conexión. Verifica tu internet');
      default:
        return new Error(error.message || 'Error de autenticación');
    }
  }

  // Errores de la API
  if (error.response) {
    const { status, data } = error.response;
    if (status === 401) {
      return new Error('Credenciales inválidas');
    }
    if (status === 400) {
      return new Error(data.message || 'Datos inválidos');
    }
    if (status === 500) {
      return new Error('Error del servidor. Intenta más tarde');
    }
    return new Error(data.message || 'Error desconocido');
  }

  return error;
};
```

### Paso 3: Crear contexto de autenticación

Crea `src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as authLogin, 
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  onAuthStateChange
} from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario guardado
    const storedUser = getStoredUser();
    if (storedUser && isAuthenticated()) {
      setUser(storedUser);
    }

    // Observar cambios en Firebase Auth
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado en Firebase
        try {
          // Obtener datos actualizados del backend
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error al obtener usuario:', error);
          // Usar datos guardados como fallback
          setUser(getStoredUser());
        }
      } else {
        // Usuario no autenticado
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authLogin(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const result = await authRegister(email, password, name);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### Paso 4: Crear componente de Login

Crea `src/components/Login.jsx`:

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirigir después del login
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};
```

### Paso 5: Crear componente protegido (Protected Route)

Crea `src/components/ProtectedRoute.jsx`:

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // O un componente de loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### Paso 6: Configurar rutas en tu aplicación

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## ⚠️ Manejo de Errores

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `auth/user-not-found` | Usuario no existe | Verificar email o registrar usuario |
| `auth/wrong-password` | Contraseña incorrecta | Verificar contraseña |
| `auth/network-request-failed` | Sin conexión | Verificar conexión a internet |
| `401 Unauthorized` | Token inválido/expirado | Hacer logout y login nuevamente |
| `500 Internal Server Error` | Error del servidor | Verificar logs del backend |

### Implementar manejo de errores global

```javascript
// En tu servicio de API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expirado
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Sin permisos
          console.error('Acceso denegado');
          break;
        case 429:
          // Rate limit
          console.error('Demasiadas peticiones. Intenta más tarde');
          break;
        case 500:
          // Error del servidor
          console.error('Error del servidor');
          break;
        default:
          console.error('Error:', data.message || 'Error desconocido');
      }
    } else if (error.request) {
      // Sin respuesta del servidor
      console.error('Sin conexión al servidor');
    } else {
      // Error en la configuración
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
```

---

## ✅ Mejores Prácticas

### 1. **Seguridad**

- ✅ **Nunca** expongas tu API Key de Firebase en el código público
- ✅ Usa variables de entorno para configuración sensible
- ✅ Valida y sanitiza inputs del usuario
- ✅ Implementa rate limiting en el frontend (opcional)

### 2. **Manejo de Tokens**

- ✅ Guarda el token en `localStorage` o `sessionStorage`
- ✅ Considera usar `httpOnly` cookies para mayor seguridad (requiere backend adicional)
- ✅ Refresca el token antes de que expire
- ✅ Limpia el token al hacer logout

### 3. **UX/UI**

- ✅ Muestra estados de carga durante autenticación
- ✅ Muestra mensajes de error claros y útiles
- ✅ Implementa validación de formularios en el cliente
- ✅ Considera "Recordarme" usando `sessionStorage` vs `localStorage`

### 4. **Performance**

- ✅ Cachea datos del usuario cuando sea apropiado
- ✅ Evita múltiples llamadas innecesarias a la API
- ✅ Usa lazy loading para rutas protegidas

### 5. **Testing**

- ✅ Prueba flujos de login/logout
- ✅ Prueba manejo de errores
- ✅ Prueba rutas protegidas
- ✅ Prueba renovación de tokens

---

## 📝 Ejemplos de Código

### Ejemplo: Hook personalizado para renovar token

```javascript
import { useEffect } from 'react';
import { auth } from '../config/firebase';

export const useTokenRefresh = () => {
  useEffect(() => {
    // Renovar token cada 50 minutos (los tokens de Firebase duran 1 hora)
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const newToken = await user.getIdToken(true); // true = forzar renovación
          localStorage.setItem('authToken', newToken);
        } catch (error) {
          console.error('Error al renovar token:', error);
        }
      }
    }, 50 * 60 * 1000); // 50 minutos

    return () => clearInterval(interval);
  }, []);
};
```

### Ejemplo: Componente de registro

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
      // Redirigir después del registro
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  );
};
```

---

## 🔗 Recursos Adicionales

- [Documentación de Firebase Auth](https://firebase.google.com/docs/auth)
- [Documentación de Axios](https://axios-http.com/docs/intro)
- [React Router](https://reactrouter.com/)

---

## 📞 Soporte

Si tienes problemas con la integración:

1. Verifica que Firebase esté configurado correctamente
2. Verifica que la URL de la API sea correcta
3. Revisa la consola del navegador para errores
4. Revisa los logs del backend

---

**Última actualización:** 2024

