# 🚀 CÓMO USAR EL PROYECTO

## Opción 1: Ejecutar Localmente (Desarrollo)

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con:
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=bancamia-dataexpress-test
FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Paso 3: Iniciar el servidor
```bash
npm run dev
```

El servidor estará en: `http://localhost:3000`

### Probar que funciona:
```bash
curl http://localhost:3000/health
```

---

## Opción 2: Desplegar a Google Cloud Run

### Usando deploy.sh (Linux/Mac):
```bash
chmod +x deploy.sh
./deploy.sh
```

### Usando deploy.ps1 (Windows PowerShell):
```powershell
.\deploy.ps1
```

**IMPORTANTE**: 
- El script usa `bancamia-dataexpress-test1` (Google Cloud PROJECT_ID)
- Firebase usa `bancamia-dataexpress-test` (sin el "1")

---

## Opción 3: Despliegue Automático con Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## Endpoints Disponibles

- `GET /health` - Health check
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/auth/me` - Perfil del usuario (requiere token)
- `POST /api/v1/solicitudes` - Crear solicitud

---

## Comandos Útiles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar con auto-reload
npm run seed       # Poblar datos de ejemplo
npm run clear      # Limpiar datos
```

