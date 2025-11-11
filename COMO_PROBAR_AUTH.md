# 🧪 Guía Rápida: Probar Login y Autenticación

## Paso 1: Obtener Token de Firebase

### Opción A: Usar get-token.html (Más fácil)

1. Abre `get-token.html` en tu navegador
2. Ingresa:
   - **Firebase API Key**: (de Firebase Console → Configuración del proyecto)
   - **Auth Domain**: `bancamia-dataexpress-test1.firebaseapp.com`
   - **Project ID**: `bancamia-dataexpress-test1`
   - **Email**: Un email de usuario existente en Firebase Auth
   - **Contraseña**: La contraseña del usuario
3. Click "Obtener Token"
4. Copia el token que aparece

### Opción B: Crear usuario primero

Si no tienes usuario, créalo en Firebase Console:
1. Ve a Firebase Console → Authentication → Users
2. Click "Add user"
3. Ingresa email y contraseña
4. Click "Add"
5. Luego usa `get-token.html` para obtener el token

## Paso 2: Probar Endpoint de Login

### Con curl:

```bash
curl -X POST https://TU-URL-DE-CLOUD-RUN/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "TU_TOKEN_AQUI"}'
```

### Con Postman:

1. **Método**: POST
2. **URL**: `https://TU-URL-DE-CLOUD-RUN/api/v1/auth/login`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "idToken": "TU_TOKEN_AQUI"
   }
   ```
5. Click "Send"

### Respuesta esperada (éxito):

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "role": "user",
      "firebaseUid": "..."
    },
    "token": "..."
  }
}
```

## Paso 3: Probar Endpoint Protegido

Después del login exitoso, usa el token para acceder a endpoints protegidos:

### GET /api/v1/auth/me

**Headers**:
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Con curl**:
```bash
curl -X GET https://TU-URL-DE-CLOUD-RUN/api/v1/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Paso 4: Verificar que Funciona

Si recibes una respuesta exitosa (200) con datos del usuario, **¡todo está funcionando!**

Aunque no veas los mensajes específicos en los logs, si los endpoints responden correctamente, significa que:
- ✅ Firebase Auth está inicializado
- ✅ ADC está funcionando
- ✅ La autenticación está operativa

## 🐛 Si hay errores

### Error 401 (No autorizado):
- Token inválido o expirado
- Obtén un nuevo token

### Error 500 (Error del servidor):
- Revisa los logs de Cloud Run para ver el error específico
- Verifica que `FIREBASE_PROJECT_ID` esté configurado

### Error "No se encontraron credenciales":
- Verifica que la cuenta de servicio esté asociada al servicio Cloud Run
- Verifica que tenga el rol `roles/firebase.admin`

