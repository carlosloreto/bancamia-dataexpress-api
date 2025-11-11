# Guía de Testing - Firebase Authentication

## 📋 Resumen

Esta guía describe cómo probar el sistema de autenticación implementado.

## 🚀 Tests Disponibles

### 1. Tests Unitarios
```bash
npm test
```
Ejecuta tests unitarios de validación y funciones básicas.

### 2. Tests de Integración
```bash
npm run test:integration
```
Ejecuta tests de integración contra el servidor corriendo.

**Requisitos:**
- Servidor debe estar corriendo (`npm start` o `npm run dev`)
- Variable de entorno `API_URL` opcional (default: http://localhost:3000)

### 3. Tests Rápidos
```bash
npm run test:quick
# O con token personalizado:
node tests/quick.test.js TU_TOKEN_AQUI
```
Ejecuta validaciones rápidas de utilidades.

## 📝 Testing Manual

Ver `tests/MANUAL_TESTING_GUIDE.md` para guía completa de testing manual.

### Endpoints Principales a Probar

1. **POST /api/v1/auth/login**
   - Con token válido → 200
   - Sin token → 400
   - Con token inválido → 401

2. **GET /api/v1/auth/me**
   - Con token válido → 200
   - Sin token → 401

3. **GET /api/v1/users**
   - Como admin → 200
   - Como usuario normal → 403
   - Sin autenticación → 401

4. **POST /api/v1/solicitudes**
   - Con autenticación → 201
   - Sin autenticación → 401

## 🔧 Configuración para Testing

### Variables de Entorno
```bash
# Para tests de integración
export API_URL=http://localhost:3000
export API_VERSION=v1
```

### Obtener Token de Prueba

1. **Desde Firebase Console:**
   - Ir a Authentication → Users
   - Crear usuario de prueba
   - Usar el UID para generar token (requiere Admin SDK)

2. **Desde Frontend:**
   - Autenticar usuario en frontend
   - Obtener `idToken` de Firebase Auth SDK
   - Usar ese token en las pruebas

## ✅ Checklist de Testing

### Autenticación Básica
- [ ] Login con token válido funciona
- [ ] Login sin token retorna error
- [ ] Login con token inválido retorna error
- [ ] Login con token expirado retorna error

### Protección de Rutas
- [ ] Rutas protegidas requieren autenticación
- [ ] Rutas de admin requieren rol admin
- [ ] Rutas públicas funcionan sin autenticación

### Ownership
- [ ] Usuario puede ver sus propias solicitudes
- [ ] Usuario NO puede ver solicitudes de otros
- [ ] Admin puede ver todas las solicitudes
- [ ] Usuario puede actualizar su propio perfil
- [ ] Usuario NO puede actualizar perfil de otros

### Rate Limiting
- [ ] Login tiene límite de 5 intentos por minuto
- [ ] Registro tiene límite de 3 intentos por hora
- [ ] Rate limit retorna 429 cuando se excede

## 🐛 Troubleshooting

### Tests fallan con "Connection refused"
- Asegúrate de que el servidor esté corriendo
- Verifica que `API_URL` apunte al servidor correcto

### Tests de integración fallan con 401
- Verifica que tengas un token válido de Firebase
- Asegúrate de que Firebase Auth esté configurado correctamente

### Tests unitarios fallan
- Verifica que todas las dependencias estén instaladas
- Asegúrate de estar usando Node.js 18+

