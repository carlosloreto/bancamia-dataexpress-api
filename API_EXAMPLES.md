# Ejemplos de Uso de la API

Este documento contiene ejemplos de cómo usar la API con diferentes herramientas.

## 🔧 Con cURL

### Health Check
```bash
curl http://localhost:3000/health
```

### Obtener todos los usuarios
```bash
curl http://localhost:3000/api/v1/users
```

### Obtener usuarios con paginación y búsqueda
```bash
curl "http://localhost:3000/api/v1/users?page=1&limit=10&search=juan"
```

### Obtener un usuario por ID
```bash
curl http://localhost:3000/api/v1/users/1
```

### Crear un nuevo usuario
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Martínez",
    "email": "pedro.martinez@example.com",
    "role": "user"
  }'
```

### Actualizar un usuario
```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez Actualizado",
    "role": "superadmin"
  }'
```

### Eliminar un usuario
```bash
curl -X DELETE http://localhost:3000/api/v1/users/3
```

## 🌐 Con JavaScript (fetch)

### Obtener todos los usuarios
```javascript
const getUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

getUsers();
```

### Crear un nuevo usuario
```javascript
const createUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Ana Silva',
        email: 'ana.silva@example.com',
        role: 'user'
      })
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

createUser();
```

### Actualizar un usuario
```javascript
const updateUser = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Nombre Actualizado',
        email: 'nuevo.email@example.com'
      })
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

updateUser('1');
```

## 📮 Con Postman / Thunder Client / Insomnia

### Colección de requests

#### 1. Health Check
- **Method**: GET
- **URL**: `http://localhost:3000/health`

#### 2. Obtener todos los usuarios
- **Method**: GET
- **URL**: `http://localhost:3000/api/v1/users`
- **Query Params**:
  - `page`: 1
  - `limit`: 10
  - `search`: (opcional)

#### 3. Crear usuario
- **Method**: POST
- **URL**: `http://localhost:3000/api/v1/users`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "name": "Lucía Rodríguez",
  "email": "lucia.rodriguez@example.com",
  "role": "user"
}
```

#### 4. Actualizar usuario
- **Method**: PUT
- **URL**: `http://localhost:3000/api/v1/users/1`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "name": "Juan Pérez Modificado",
  "role": "admin"
}
```

#### 5. Eliminar usuario
- **Method**: DELETE
- **URL**: `http://localhost:3000/api/v1/users/2`

## 🐍 Con Python (requests)

```python
import requests
import json

BASE_URL = 'http://localhost:3000/api/v1'

# Obtener todos los usuarios
def get_users():
    response = requests.get(f'{BASE_URL}/users')
    print(response.json())

# Crear un usuario
def create_user():
    user_data = {
        'name': 'Miguel Torres',
        'email': 'miguel.torres@example.com',
        'role': 'user'
    }
    response = requests.post(
        f'{BASE_URL}/users',
        headers={'Content-Type': 'application/json'},
        data=json.dumps(user_data)
    )
    print(response.json())

# Actualizar un usuario
def update_user(user_id):
    update_data = {
        'name': 'Miguel Torres Actualizado'
    }
    response = requests.put(
        f'{BASE_URL}/users/{user_id}',
        headers={'Content-Type': 'application/json'},
        data=json.dumps(update_data)
    )
    print(response.json())

# Eliminar un usuario
def delete_user(user_id):
    response = requests.delete(f'{BASE_URL}/users/{user_id}')
    print(response.json())

# Ejecutar funciones
get_users()
create_user()
```

## 🧪 Casos de Prueba

### Test de validación - Email duplicado
```bash
# Primer usuario
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Intentar crear con el mismo email (debería fallar con 409)
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Another User", "email": "test@example.com"}'
```

### Test de validación - Campos requeridos
```bash
# Falta el campo email (debería fallar con 400)
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User"}'
```

### Test de recurso no encontrado
```bash
# Usuario que no existe (debería retornar 404)
curl http://localhost:3000/api/v1/users/999999
```

### Test de ruta no encontrada
```bash
# Ruta que no existe (debería retornar 404)
curl http://localhost:3000/api/v1/nonexistent
```

## 📊 Respuestas Esperadas

### Éxito (200/201)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error de Validación (400)
```json
{
  "error": {
    "message": "Los campos name y email son requeridos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": { ... }
  }
}
```

### Recurso No Encontrado (404)
```json
{
  "error": {
    "message": "Usuario con ID 999 no encontrado",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

### Conflicto (409)
```json
{
  "error": {
    "message": "El email ya está registrado",
    "code": "CONFLICT_ERROR",
    "statusCode": 409,
    "details": { ... }
  }
}
```


