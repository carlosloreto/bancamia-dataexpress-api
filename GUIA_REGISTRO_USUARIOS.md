# 📝 Guía de Registro de Usuarios - Frontend React

Esta guía te muestra cómo implementar el registro completo de usuarios con todos sus datos en tu aplicación React.

## 📋 Campos Disponibles para Registro

El endpoint `/api/v1/auth/register` acepta los siguientes campos:

### Campos Requeridos
- **email**: Email del usuario (requerido si no se proporciona idToken)
- **password**: Contraseña del usuario (requerido si no se proporciona idToken)

### Campos Opcionales
- **name**: Nombre completo del usuario
- **role**: Rol del usuario (por defecto: 'user', puede ser 'admin', 'user', etc.)
- **idToken**: Token de Firebase (si el usuario ya fue creado en Firebase Auth)

---

## 🔄 Flujo de Registro

```
1. Usuario completa formulario de registro
   ↓
2. Frontend valida datos del formulario
   ↓
3. Frontend crea usuario en Firebase Auth (email/password)
   ↓
4. Firebase Auth retorna idToken
   ↓
5. Frontend envía idToken + datos adicionales a POST /api/v1/auth/register
   ↓
6. Backend crea usuario en Firestore con todos los datos
   ↓
7. Backend retorna usuario completo
   ↓
8. Frontend guarda token y datos del usuario
   ↓
9. Usuario queda autenticado y redirigido
```

---

## 💻 Implementación Completa

### 1. Componente de Registro Completo

Crea `src/components/Register.jsx`:

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
    role: 'user' // Por defecto 'user'
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

    // Validar nombre (opcional pero recomendado)
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
      // Registrar usuario (el servicio maneja Firebase Auth y la API)
      await register(
        formData.email,
        formData.password,
        formData.name.trim(),
        formData.role // Pasar role si es necesario
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

            {/* Role (opcional, solo si necesitas que el usuario elija) */}
            {/* Descomenta si necesitas que el usuario elija su rol */}
            {/* 
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Tipo de Usuario
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            */}
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

### 2. Actualizar Servicio de Autenticación

Actualiza `src/services/auth.service.js` para soportar el campo `role`:

```javascript
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
```

---

### 3. Formulario de Registro con Más Campos (Opcional)

Si necesitas más campos en el registro, puedes expandir el formulario:

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '', // Nuevo campo
  company: '', // Nuevo campo
  role: 'user'
});

// En el JSX, agregar más campos:
<div>
  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
    Teléfono
  </label>
  <input
    id="phone"
    name="phone"
    type="tel"
    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    placeholder="+57 300 123 4567"
    value={formData.phone}
    onChange={handleChange}
  />
</div>
```

**Nota:** Si agregas campos adicionales que no están en el endpoint de registro, tendrás que:
1. Actualizar el endpoint del backend para aceptarlos, O
2. Hacer una petición adicional después del registro para actualizar el perfil del usuario

---

### 4. Actualizar Perfil Después del Registro

Si necesitas agregar más datos después del registro, puedes hacer una petición adicional:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    // 1. Registrar usuario básico
    await register(formData.email, formData.password, formData.name);
    
    // 2. Actualizar perfil con datos adicionales (si el endpoint existe)
    try {
      await api.put('/users/me', {
        phone: formData.phone,
        company: formData.company,
        // otros campos adicionales
      });
    } catch (updateError) {
      console.warn('No se pudieron actualizar datos adicionales:', updateError);
      // Continuar de todas formas, el registro fue exitoso
    }
    
    navigate('/dashboard');
  } catch (error) {
    setErrors({ general: error.message || 'Error al registrar usuario' });
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Validaciones Recomendadas

### Validación de Email
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Validación de Contraseña Fuerte
```javascript
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return errors;
};
```

### Validación de Nombre
```javascript
const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  if (name.trim().length > 100) {
    return 'El nombre es demasiado largo';
  }
  return '';
};
```

---

## 🎨 Ejemplo con React Hook Form (Opcional)

Si prefieres usar React Hook Form para mejor manejo de formularios:

```bash
npm install react-hook-form
```

```javascript
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser(data.email, data.password, data.name, data.role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'El nombre es requerido' })}
        placeholder="Nombre"
      />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input
        {...register('email', {
          required: 'El email es requerido',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input
        type="password"
        {...register('password', {
          required: 'La contraseña es requerida',
          minLength: {
            value: 6,
            message: 'Mínimo 6 caracteres'
          }
        })}
        placeholder="Contraseña"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <input
        type="password"
        {...register('confirmPassword', {
          required: 'Confirma tu contraseña',
          validate: value => value === password || 'Las contraseñas no coinciden'
        })}
        placeholder="Confirmar Contraseña"
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  );
};
```

---

## 📝 Resumen

1. **Campos básicos**: email, password, name
2. **Campos opcionales**: role
3. **Validación**: Email válido, contraseña segura, contraseñas coinciden
4. **Flujo**: Firebase Auth → idToken → API Backend → Usuario creado
5. **Después del registro**: Usuario queda autenticado automáticamente

---

## 🔗 Próximos Pasos

Después de implementar el registro:
1. Agregar página de perfil para que el usuario complete más datos
2. Implementar verificación de email
3. Agregar opción de "Recordarme"
4. Implementar recuperación de contraseña

---

**Última actualización:** 2024

