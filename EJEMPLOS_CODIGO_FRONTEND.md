# 📦 Ejemplos de Código - Integración Frontend React

Este archivo contiene ejemplos completos y listos para usar de código para integrar la autenticación en tu aplicación React.

## 📁 Estructura de Archivos

```
src/
├── config/
│   └── firebase.js          # Configuración de Firebase
├── services/
│   ├── api.js               # Cliente HTTP con interceptores
│   └── auth.service.js      # Servicio de autenticación
├── contexts/
│   └── AuthContext.jsx      # Context de autenticación (React)
├── hooks/
│   └── useAuth.js           # Hook personalizado (alternativa)
├── components/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ProtectedRoute.jsx
└── utils/
    └── errorHandler.js      # Utilidades para manejo de errores
```

---

## 🔧 1. Configuración de Firebase

### `src/config/firebase.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Opcional: agrega otras configuraciones si las necesitas
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

// Configuración adicional de Auth (opcional)
auth.languageCode = 'es'; // Idioma español

export default app;
```

---

## 🌐 2. Servicio de API

### `src/services/api.js`

```javascript
import axios from 'axios';

// URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

/**
 * Interceptor de request: Agrega token a todas las peticiones
 */
api.interceptors.request.use(
  (config) => {
    // Obtener token del almacenamiento
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

/**
 * Interceptor de response: Maneja errores globalmente
 */
api.interceptors.response.use(
  (response) => {
    // Retornar respuesta exitosa
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Error 401: Token expirado o inválido
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Limpiar datos de autenticación
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // Redirigir a login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Error 403: Sin permisos
    if (error.response?.status === 403) {
      console.error('Acceso denegado');
      // Opcional: mostrar notificación
    }

    // Error 429: Rate limit
    if (error.response?.status === 429) {
      console.error('Demasiadas peticiones. Intenta más tarde');
      // Opcional: mostrar notificación con tiempo de espera
    }

    // Error 500: Error del servidor
    if (error.response?.status >= 500) {
      console.error('Error del servidor');
      // Opcional: mostrar notificación
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 3. Servicio de Autenticación

### `src/services/auth.service.js`

```javascript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

/**
 * Login con email y password
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{success: boolean, user: object, token: string}>}
 */
export const login = async (email, password) => {
  try {
    // 1. Autenticar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // 2. Obtener idToken de Firebase
    const idToken = await firebaseUser.getIdToken();

    // 3. Enviar token a la API backend para sincronizar con Firestore
    const response = await api.post('/auth/login', { idToken });

    // 4. Verificar respuesta exitosa
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en el login');
    }

    // 5. Guardar token y datos del usuario
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
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} name - Nombre del usuario
 * @param {string} role - Rol del usuario (opcional, default: 'user')
 * @returns {Promise<{success: boolean, user: object}>}
 */
export const register = async (email, password, name, role = 'user') => {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Actualizar perfil con nombre (opcional)
    if (name) {
      await updateProfile(firebaseUser, { displayName: name });
    }

    // 3. Obtener idToken
    const idToken = await firebaseUser.getIdToken();

    // 4. Registrar en la API backend con todos los datos
    const response = await api.post('/auth/register', {
      idToken,
      email,
      name: name || firebaseUser.displayName || '',
      role: role || 'user' // Incluir role si se proporciona
    });

    // 5. Verificar respuesta exitosa
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en el registro');
    }

    // 6. Guardar token y datos del usuario
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
 * Logout del usuario
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // 1. Cerrar sesión en Firebase
    await firebaseSignOut(auth);
    
    // 2. Limpiar almacenamiento local
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

/**
 * Obtener perfil del usuario autenticado desde el backend
 * @returns {Promise<object>}
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
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Obtener usuario del almacenamiento local
 * @returns {object|null}
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Obtener token del almacenamiento local
 * @returns {string|null}
 */
export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Observar cambios en el estado de autenticación de Firebase
 * @param {Function} callback - Función a ejecutar cuando cambia el estado
 * @returns {Function} Función para desuscribirse
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Enviar email de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw handleAuthError(error);
  }
};

/**
 * Renovar token de Firebase
 * @returns {Promise<string>} Nuevo token
 */
export const refreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }
    
    // Forzar renovación del token
    const newToken = await user.getIdToken(true);
    
    // Actualizar token en almacenamiento
    localStorage.setItem('authToken', newToken);
    
    return newToken;
  } catch (error) {
    console.error('Error al renovar token:', error);
    throw error;
  }
};

/**
 * Manejar errores de autenticación y convertirlos en mensajes amigables
 * @param {Error} error - Error capturado
 * @returns {Error} Error con mensaje amigable
 */
const handleAuthError = (error) => {
  // Errores de Firebase Auth
  if (error.code) {
    const errorMessages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/invalid-credential': 'Credenciales inválidas',
    };

    return new Error(errorMessages[error.code] || error.message || 'Error de autenticación');
  }

  // Errores de la API
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 401) {
      return new Error('Credenciales inválidas o token expirado');
    }
    if (status === 400) {
      return new Error(data.message || 'Datos inválidos');
    }
    if (status === 403) {
      return new Error('No tienes permisos para realizar esta acción');
    }
    if (status === 429) {
      return new Error('Demasiadas peticiones. Intenta más tarde');
    }
    if (status >= 500) {
      return new Error('Error del servidor. Intenta más tarde');
    }
    
    return new Error(data.message || 'Error desconocido');
  }

  // Error de red
  if (error.request) {
    return new Error('Sin conexión al servidor. Verifica tu internet');
  }

  // Otro tipo de error
  return error;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  getStoredToken,
  onAuthStateChange,
  resetPassword,
  refreshToken
};
```

---

## 🎣 4. Context de Autenticación (React)

### `src/contexts/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as authLogin, 
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  onAuthStateChange,
  refreshToken
} from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay usuario guardado al cargar
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
          setError(null);
        } catch (error) {
          console.error('Error al obtener usuario:', error);
          // Usar datos guardados como fallback
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            setUser(null);
          }
        }
      } else {
        // Usuario no autenticado
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Renovar token periódicamente (cada 50 minutos)
    const tokenRefreshInterval = setInterval(async () => {
      if (isAuthenticated()) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Error al renovar token:', error);
        }
      }
    }, 50 * 60 * 1000); // 50 minutos

    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await authLogin(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      const result = await authRegister(email, password, name);
      setUser(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authLogout();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    clearError: () => setError(null)
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

---

## 🎨 5. Componente de Login

### `src/components/Login.jsx`

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## 📝 6. Componente de Registro

### `src/components/Register.jsx`

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'user'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar nombre
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Registrar usuario
      await register(
        formData.email,
        formData.password,
        formData.name.trim(),
        formData.role
      );
      
      // Redirigir después del registro exitoso
      navigate('/dashboard');
    } catch (error) {
      // Manejar errores específicos
      if (error.message.includes('email')) {
        setErrors({ email: error.message });
      } else if (error.message.includes('contraseña')) {
        setErrors({ password: error.message });
      } else {
        setErrors({ general: error.message || 'Error al registrar usuario' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa tus datos para registrarte
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## 🛡️ 7. Componente ProtectedRoute

### `src/components/ProtectedRoute.jsx`

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## 📄 8. Archivo .env de Ejemplo

### `.env.example`

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id

# API Configuration
VITE_API_BASE_URL=https://tu-api.cloud.run.app
```

---

## 📝 Notas de Uso

1. **Instalación de dependencias:**
   ```bash
   npm install firebase axios react-router-dom
   ```

2. **Configurar variables de entorno:**
   - Copia `.env.example` a `.env`
   - Completa con tus valores reales

3. **Usar en tu aplicación:**
   ```javascript
   import { AuthProvider } from './contexts/AuthContext';
   import { ProtectedRoute } from './components/ProtectedRoute';
   import { Login } from './components/Login';
   import { Register } from './components/Register';
   ```

4. **Ejemplo de uso del hook:**
   ```javascript
   import { useAuth } from './contexts/AuthContext';
   
   function MyComponent() {
     const { user, login, register, logout } = useAuth();
     // ...
   }
   ```

5. **Configurar rutas en App.jsx:**
   ```javascript
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import { AuthProvider } from './contexts/AuthContext';
   import { ProtectedRoute } from './components/ProtectedRoute';
   import { Login } from './components/Login';
   import { Register } from './components/Register';
   import Dashboard from './pages/Dashboard';

   function App() {
     return (
       <AuthProvider>
         <BrowserRouter>
           <Routes>
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
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
   ```

---

**Última actualización:** 2024

