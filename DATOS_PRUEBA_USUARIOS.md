# 📋 Datos de Prueba - Usuario Completo

Aquí tienes ejemplos de JSON con datos completos de usuarios para usar en Postman o en tus pruebas.

---

## 🎯 JSON para Registro (POST /api/v1/auth/register)

### Usuario Básico Completo

```json
{
  "email": "juan.perez@ejemplo.com",
  "password": "password123",
  "name": "Juan Pérez",
  "role": "user"
}
```

### Usuario Administrador

```json
{
  "email": "admin@bancamia.com",
  "password": "Admin123!",
  "name": "María García",
  "role": "admin"
}
```

### Usuario Completo con Todos los Campos

```json
{
  "email": "carlos.rodriguez@ejemplo.com",
  "password": "SecurePass2024!",
  "name": "Carlos Rodríguez",
  "role": "user"
}
```

---

## 📝 Múltiples Usuarios de Prueba

### Usuario 1: Cliente Regular

```json
{
  "email": "cliente1@ejemplo.com",
  "password": "cliente123",
  "name": "Ana Martínez",
  "role": "user"
}
```

### Usuario 2: Ejecutivo

```json
{
  "email": "ejecutivo@ejemplo.com",
  "password": "ejecutivo456",
  "name": "Roberto Sánchez",
  "role": "user"
}
```

### Usuario 3: Supervisor

```json
{
  "email": "supervisor@ejemplo.com",
  "password": "supervisor789",
  "name": "Laura Fernández",
  "role": "admin"
}
```

### Usuario 4: Usuario de Prueba

```json
{
  "email": "test@test.com",
  "password": "test123456",
  "name": "Usuario de Prueba",
  "role": "user"
}
```

### Usuario 5: Demo

```json
{
  "email": "demo@bancamia.com",
  "password": "demo2024",
  "name": "Usuario Demo",
  "role": "user"
}
```

---

## 🔧 JSON para Postman (Listo para Copiar)

### Ejemplo 1: Usuario Completo

```json
{
  "email": "juan.perez@ejemplo.com",
  "password": "password123",
  "name": "Juan Pérez González",
  "role": "user"
}
```

### Ejemplo 2: Solo Campos Requeridos

```json
{
  "email": "minimo@ejemplo.com",
  "password": "minimo123"
}
```

### Ejemplo 3: Con Rol Específico

```json
{
  "email": "admin@ejemplo.com",
  "password": "admin123",
  "name": "Administrador del Sistema",
  "role": "admin"
}
```

---

## 📦 Colección Completa de Usuarios de Prueba

```json
[
  {
    "email": "usuario1@ejemplo.com",
    "password": "password123",
    "name": "Pedro López",
    "role": "user"
  },
  {
    "email": "usuario2@ejemplo.com",
    "password": "password123",
    "name": "María González",
    "role": "user"
  },
  {
    "email": "usuario3@ejemplo.com",
    "password": "password123",
    "name": "Carlos Ramírez",
    "role": "user"
  },
  {
    "email": "admin1@ejemplo.com",
    "password": "admin123",
    "name": "Ana Administradora",
    "role": "admin"
  },
  {
    "email": "test.user@ejemplo.com",
    "password": "test123456",
    "name": "Usuario de Prueba",
    "role": "user"
  }
]
```

---

## 🎨 Datos Realistas para Pruebas

### Usuario con Datos Completos (Ejemplo Realista)

```json
{
  "email": "carlos.loreto@bancamia.com",
  "password": "Bancamia2024!",
  "name": "Carlos Loreto",
  "role": "user"
}
```

### Usuario Gerente

```json
{
  "email": "gerente@bancamia.com",
  "password": "Gerente123!",
  "name": "Roberto Martínez",
  "role": "admin"
}
```

### Usuario Analista

```json
{
  "email": "analista@bancamia.com",
  "password": "Analista456!",
  "name": "Laura Sánchez",
  "role": "user"
}
```

---

## ⚠️ Notas Importantes

1. **Email único**: Cada email debe ser único. Si intentas registrar un email que ya existe, recibirás un error 409.

2. **Password mínimo**: La contraseña debe tener al menos 6 caracteres.

3. **Formato de email**: Debe ser un email válido (ej: `usuario@dominio.com`).

4. **Role**: Los valores comunes son `"user"` o `"admin"`. Si no especificas role, por defecto será `"user"`.

---

## 🧪 Para Probar en Postman

1. Copia cualquiera de los JSON anteriores
2. En Postman:
   - Método: `POST`
   - URL: `https://TU-URL/api/v1/auth/register`
   - Headers: `Content-Type: application/json`
   - Body: Pega el JSON copiado
3. Click en "Send"

---

## 📋 Respuesta Esperada

Después de registrar exitosamente, recibirás:

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "abc123def456...",
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

---

**Última actualización:** 2024

