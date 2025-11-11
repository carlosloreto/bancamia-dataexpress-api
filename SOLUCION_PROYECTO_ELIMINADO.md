# 🔥 CÓMO OBTENER LAS CREDENCIALES CORRECTAS DE FIREBASE

## El problema:
El proyecto #533748472645 fue eliminado. Necesitas las credenciales del proyecto correcto.

## Solución:

### Paso 1: Ve a Firebase Console
1. Abre: https://console.firebase.google.com/
2. Selecciona el proyecto: **bancamia-dataexpress-test** (sin el "1")

### Paso 2: Obtener las credenciales
1. Ve a **Configuración del proyecto** (⚙️)
2. Baja hasta **Tus aplicaciones**
3. Si no tienes una app web, crea una (ícono `</>`)
4. Copia las credenciales:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // ← Copia este
  authDomain: "bancamia-dataexpress-test.firebaseapp.com",
  projectId: "bancamia-dataexpress-test",
  storageBucket: "bancamia-dataexpress-test.firebasestorage.app",
  messagingSenderId: "123456789",  // ← Copia este (NUEVO número)
  appId: "1:123456789:web:abc123",  // ← Copia este (NUEVO)
  measurementId: "G-XXXXX"  // ← Copia este (si existe)
};
```

### Paso 3: Actualizar los scripts de despliegue

Una vez que tengas las nuevas credenciales, actualiza:
- `deploy.sh` (línea 46)
- `deploy.ps1` (línea 33)

Reemplaza estos valores:
- `FIREBASE_MESSAGING_SENDER_ID=533748472645` → Tu nuevo número
- `FIREBASE_APP_ID=1:533748472645:web:ffebad4f00b8009873fc2c` → Tu nuevo appId
- `FIREBASE_API_KEY` → Tu nueva API key (si cambió)
- `FIREBASE_MEASUREMENT_ID` → Tu nuevo measurement ID (si existe)

### Paso 4: Verificar que el proyecto existe

Ejecuta:
```bash
gcloud projects list | grep bancamia
```

Deberías ver:
- `bancamia-dataexpress-test1` (Google Cloud PROJECT_ID)
- Y el proyecto Firebase `bancamia-dataexpress-test` debe estar vinculado

### Paso 5: Actualizar Cloud Run

Después de actualizar los scripts, vuelve a desplegar:
```bash
./deploy.sh
```

---

## ⚠️ IMPORTANTE:
- **Google Cloud PROJECT_ID**: `bancamia-dataexpress-test1` (con "1")
- **Firebase Project ID**: `bancamia-dataexpress-test` (sin "1")
- Ambos deben estar vinculados en Firebase Console

