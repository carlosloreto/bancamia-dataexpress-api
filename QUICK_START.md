# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha la API en **menos de 5 minutos** usando el emulador local de Firestore.

## ⚡ Inicio Rápido (Desarrollo Local)

### 1️⃣ Requisitos Previos

```bash
# Verificar que tienes Node.js >= 18
node --version

# Verificar que tienes npm
npm --version
```

### 2️⃣ Instalación (Una sola vez)

```bash
# Instalar dependencias del proyecto
npm install

# Instalar Firebase CLI globalmente
npm install -g firebase-tools
```

### 3️⃣ Configuración (Ya está lista!)

El archivo `.env` ya está configurado para desarrollo local con el emulador:

```env
FIREBASE_PROJECT_ID=demo-project
FIRESTORE_EMULATOR_HOST=localhost:8080
NODE_ENV=development
```

✅ **¡No necesitas credenciales de Firebase para desarrollo!**

### 4️⃣ Iniciar la Aplicación

Necesitas **2 terminales**:

#### Terminal 1 - Firestore Emulator:
```bash
firebase emulators:start
```

Espera a ver este mensaje:
```
✔ All emulators ready! It is now safe to connect your app.
┌─────────────┬────────────────┬─────────────────────────────────┐
│ Emulator    │ Host:Port      │ View in Emulator UI             │
├─────────────┼────────────────┼─────────────────────────────────┤
│ Firestore   │ localhost:8080 │ http://localhost:4000/firestore │
└─────────────┴────────────────┴─────────────────────────────────┘
```

#### Terminal 2 - API Express:
```bash
npm run dev
```

Verás este mensaje cuando esté listo:
```
[INFO] 🚀 Servidor iniciado exitosamente
```

### 5️⃣ Poblar con Datos de Ejemplo

En una tercera terminal (o en la Terminal 2):

```bash
npm run seed
```

### 6️⃣ Probar la API

Abre tu navegador o usa cURL:

```bash
# Health Check
curl http://localhost:3000/health

# Ver usuarios
curl http://localhost:3000/api/v1/users

# Crear un usuario
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"user"}'
```

O simplemente visita:
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Usuarios**: http://localhost:3000/api/v1/users
- **Emulator UI**: http://localhost:4000 (interfaz visual de Firestore)

## 📱 Comandos Útiles

```bash
# Desarrollo - Auto reload
npm run dev

# Producción
npm start

# Poblar datos de ejemplo
npm run seed

# Forzar seed (elimina datos existentes)
npm run seed:force

# Limpiar todos los datos
npm run clear

# Detener emulador
# Presiona Ctrl+C en la terminal del emulador
```

## 🔍 Verificar que Todo Funciona

1. **Emulador corriendo**: Visita http://localhost:4000
2. **API corriendo**: Visita http://localhost:3000/health
3. **Datos poblados**: Visita http://localhost:3000/api/v1/users

## 🐛 Solución de Problemas

### El emulador no inicia

**Problema**: Puerto 8080 o 4000 ya en uso

**Solución**: Edita `firebase.json` y cambia los puertos:
```json
{
  "emulators": {
    "firestore": {
      "port": 8081
    },
    "ui": {
      "enabled": true,
      "port": 4001
    }
  }
}
```

Y actualiza `.env`:
```env
FIRESTORE_EMULATOR_HOST=localhost:8081
```

### La API no conecta con Firestore

**Solución**: Asegúrate de que:
1. El emulador está corriendo ANTES de iniciar la API
2. La variable `FIRESTORE_EMULATOR_HOST` en `.env` coincide con el puerto del emulador
3. NODE_ENV está en "development"

### No hay datos

**Solución**: Ejecuta el seed:
```bash
npm run seed
```

## 🎯 Próximos Pasos

Una vez que todo funciona localmente:

1. ✅ Explora la [Documentación Completa](./README.md)
2. ✅ Lee sobre [Configuración de Firebase](./FIREBASE_SETUP.md)
3. ✅ Revisa los [Ejemplos de API](./API_EXAMPLES.md)
4. ✅ Agrega autenticación
5. ✅ Despliega a producción con credenciales reales

## 💡 Tips

- **Emulator UI** (http://localhost:4000) es tu mejor amigo para inspeccionar datos
- Los datos del emulador se pierden cuando lo detienes (perfecto para pruebas)
- Puedes exportar/importar datos del emulador para tests consistentes
- El emulador NO requiere internet ni credenciales

---

**¿Listo?** ¡Abre dos terminales y comienza! 🚀


