# 📮 Guía: Registrar Usuario desde Postman

Esta guía te muestra cómo registrar un nuevo usuario usando Postman para probar el endpoint de registro de la API.

---

## 🎯 Método 1: Registro con Email y Password (Recomendado)

Esta es la forma más directa desde Postman. El backend creará el usuario en Firebase Auth automáticamente.

### Configuración en Postman

1. **Método HTTP**: `POST`

2. **URL**: 
   ```
   https://TU-URL-DE-CLOUD-RUN/api/v1/auth/register
   ```
   O si estás probando localmente:
   ```
   http://localhost:3000/api/v1/auth/register
   ```

3. **Headers**:
   ```
   Content-Type: application/json
   ```

4. **Body** (raw JSON):
   ```json
   {
     "email": "usuario@ejemplo.com",
     "password": "password123",
     "name": "Juan Pérez",
     "role": "user"
   }
   ```

### Campos del Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | string | ✅ Sí | Email del usuario |
| `password` | string | ✅ Sí | Contraseña (mínimo 6 caracteres) |
| `name` | string | ❌ No | Nombre completo del usuario |
| `role` | string | ❌ No | Rol del usuario (default: 'user') |

### Ejemplo Completo de Body

```json
{
  "email": "juan.perez@ejemplo.com",
  "password": "miPassword123",
  "name": "Juan Pérez",
  "role": "user"
}
```

### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "abc123...",
      "firebaseUid": "firebase-uid-123",
      "email": "juan.perez@ejemplo.com",
      "name": "Juan Pérez",
      "role": "user",
      "emailVerified": false,
      "photoURL": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Errores Comunes

#### Error 400 - Validación
```json
{
  "error": {
    "message": "El email es requerido",
    "code": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

#### Error 409 - Email ya existe
```json
{
  "error": {
    "message": "El email ya está registrado",
    "code": "CONFLICT_ERROR",
    "statusCode": 409
  }
}
```

#### Error 429 - Rate Limit
```json
{
  "error": {
    "message": "Demasiadas peticiones. Intenta más tarde",
    "code": "RATE_LIMIT_ERROR",
    "statusCode": 429
  }
}
```

---

## 🎯 Método 2: Registro con idToken de Firebase

Si ya tienes un token de Firebase Auth (por ejemplo, desde el frontend), puedes usarlo directamente.

### Configuración en Postman

1. **Método HTTP**: `POST`

2. **URL**: 
   ```
   https://TU-URL-DE-CLOUD-RUN/api/v1/auth/register
   ```

3. **Headers**:
   ```
   Content-Type: application/json
   ```

4. **Body** (raw JSON):
   ```json
   {
     "idToken": "TU_TOKEN_DE_FIREBASE_AQUI",
     "name": "Juan Pérez",
     "role": "user"
   }
   ```

**Nota**: Con este método, el usuario ya debe existir en Firebase Auth. El backend solo lo sincronizará con Firestore.

---

## 📋 Pasos Detallados en Postman

### Paso 1: Crear Nueva Request

1. Abre Postman
2. Click en **"New"** → **"HTTP Request"**
3. O usa el atajo `Ctrl+N` (Windows/Linux) o `Cmd+N` (Mac)

### Paso 2: Configurar Método y URL

1. Selecciona **POST** del dropdown
2. Ingresa la URL:
   ```
   https://TU-URL/api/v1/auth/register
   ```

### Paso 3: Configurar Headers

1. Ve a la pestaña **"Headers"**
2. Agrega:
   - **Key**: `Content-Type`
   - **Value**: `application/json`

### Paso 4: Configurar Body

1. Ve a la pestaña **"Body"**
2. Selecciona **"raw"**
3. En el dropdown de la derecha, selecciona **"JSON"**
4. Pega el siguiente JSON:

```json
{
  "email": "test@ejemplo.com",
  "password": "password123",
  "name": "Usuario de Prueba",
  "role": "user"
}
```

### Paso 5: Enviar Request

1. Click en **"Send"**
2. Revisa la respuesta en la parte inferior

---

## 🧪 Ejemplos de Pruebas

### Ejemplo 1: Registro Básico

```json
{
  "email": "maria.garcia@ejemplo.com",
  "password": "securePass123",
  "name": "María García"
}
```

### Ejemplo 2: Registro con Rol Específico

```json
{
  "email": "admin@ejemplo.com",
  "password": "adminPass123",
  "name": "Administrador",
  "role": "admin"
}
```

### Ejemplo 3: Registro Mínimo (solo email y password)

```json
{
  "email": "minimo@ejemplo.com",
  "password": "pass123"
}
```

---

## 🔍 Verificar Usuario Registrado

Después de registrar un usuario, puedes verificar que se creó correctamente usando el endpoint de login:

### Login del Usuario Recién Registrado

1. **Método**: `POST`
2. **URL**: `https://TU-URL/api/v1/auth/login`
3. **Body**:
   ```json
   {
     "idToken": "TOKEN_DE_FIREBASE"
   }
   ```

**Nota**: Para obtener el idToken, necesitas autenticarte primero con Firebase Auth desde el frontend o usar `get-token.html`.

---

## 🐛 Solución de Problemas

### Error: "El email es requerido"
- Verifica que el campo `email` esté en el body
- Verifica que el Content-Type sea `application/json`

### Error: "La contraseña es requerida"
- Verifica que el campo `password` esté en el body
- La contraseña debe tener al menos 6 caracteres

### Error: "El formato del email no es válido"
- Verifica que el email tenga un formato válido (ej: `usuario@dominio.com`)

### Error: "El email ya está registrado"
- El email ya existe en Firebase Auth
- Intenta con otro email o elimina el usuario existente desde Firebase Console

### Error: 429 Rate Limit
- Has excedido el límite de peticiones por minuto
- Espera unos minutos antes de intentar de nuevo

### Error: 500 Internal Server Error
- Revisa los logs del servidor
- Verifica que Firebase esté configurado correctamente
- Verifica que las credenciales de Firebase sean válidas

---

## 📝 Colección de Postman (Opcional)

Puedes crear una colección en Postman con todos los endpoints:

### Colección: Bancamia DataExpress API

```json
{
  "info": {
    "name": "Bancamia DataExpress API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@ejemplo.com\",\n  \"password\": \"password123\",\n  \"name\": \"Usuario de Prueba\",\n  \"role\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"idToken\": \"{{firebaseToken}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://TU-URL-DE-CLOUD-RUN",
      "type": "string"
    },
    {
      "key": "firebaseToken",
      "value": "",
      "type": "string"
    }
  ]
}
```

Para usar esta colección:
1. Copia el JSON anterior
2. En Postman: **Import** → **Raw text** → Pega el JSON
3. Actualiza la variable `baseUrl` con tu URL real

---

## ✅ Checklist de Prueba

- [ ] Postman configurado con método POST
- [ ] URL correcta del endpoint
- [ ] Header `Content-Type: application/json` agregado
- [ ] Body en formato JSON con email y password
- [ ] Email tiene formato válido
- [ ] Password tiene al menos 6 caracteres
- [ ] Request enviado exitosamente
- [ ] Respuesta 201 con datos del usuario
- [ ] Usuario creado en Firebase Auth (verificar en Firebase Console)

---

## 🔗 Recursos Adicionales

- [Documentación de Postman](https://learning.postman.com/docs/)
- [Guía de Autenticación](./GUIA_FRONTEND_AUTH.md)
- [Cómo Probar Auth](./COMO_PROBAR_AUTH.md)

---

**Última actualización:** 2024

