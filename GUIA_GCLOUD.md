# 🛠️ Guía de Comandos gcloud Útiles

## 📋 Configuración Inicial

### Configurar proyecto
```bash
gcloud config set project bancamia-dataexpress-test1
```

### Ver configuración actual
```bash
gcloud config list
```

### Ver cuenta autenticada
```bash
gcloud auth list
```

### Cambiar cuenta
```bash
gcloud auth login
```

## 🚀 Cloud Run

### Ver servicios desplegados
```bash
gcloud run services list --region=southamerica-east1
```

### Ver detalles de un servicio
```bash
gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1
```

### Ver URL del servicio
```bash
gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --format='value(status.url)'
```

### Ver logs en tiempo real
```bash
gcloud run services logs read bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --limit=50
```

### Ver logs con filtro
```bash
gcloud run services logs read bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --filter="textPayload:Firebase"
```

### Ver variables de entorno
```bash
gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Actualizar variable de entorno
```bash
gcloud run services update bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --update-env-vars="FIREBASE_PROJECT_ID=bancamia-dataexpress-test"
```

### Ver cuenta de servicio asociada
```bash
gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.serviceAccountName)"
```

## 🔐 IAM y Cuentas de Servicio

### Listar cuentas de servicio
```bash
gcloud iam service-accounts list
```

### Ver detalles de cuenta de servicio
```bash
gcloud iam service-accounts describe firebase-admin@bancamia-dataexpress-test1.iam.gserviceaccount.com
```

### Ver permisos de una cuenta de servicio
```bash
gcloud projects get-iam-policy bancamia-dataexpress-test1 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:firebase-admin@bancamia-dataexpress-test1.iam.gserviceaccount.com"
```

### Otorgar permiso a cuenta de servicio
```bash
gcloud projects add-iam-policy-binding bancamia-dataexpress-test1 \
  --member="serviceAccount:firebase-admin@bancamia-dataexpress-test1.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"
```

## 📊 Cloud Build

### Ver builds recientes
```bash
gcloud builds list --limit=10
```

### Ver detalles de un build
```bash
gcloud builds describe BUILD_ID
```

### Ver logs de un build
```bash
gcloud builds log BUILD_ID
```

## 🔍 Búsqueda y Filtrado

### Buscar servicios por nombre
```bash
gcloud run services list --filter="name:bancamia"
```

### Ver solo URLs de servicios
```bash
gcloud run services list --format="table(name,status.url)"
```

## 🧪 Testing

### Probar endpoint de health
```bash
curl $(gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --format='value(status.url)')/api/v1/health
```

## 📝 Comandos Útiles Rápidos

### Ver estado completo del servicio
```bash
gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --format=yaml
```

### Ver revisiones del servicio
```bash
gcloud run revisions list \
  --service=bancamia-dataexpress-api \
  --region=southamerica-east1
```

### Ver tráfico de revisiones
```bash
gcloud run services describe bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --format="value(status.traffic)"
```

## 🆘 Troubleshooting

### Ver errores recientes en logs
```bash
gcloud run services logs read bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --limit=100 \
  --filter="severity>=ERROR"
```

### Verificar que ADC está funcionando
```bash
gcloud run services logs read bancamia-dataexpress-api \
  --region=southamerica-east1 \
  --limit=50 \
  --filter="textPayload:Application Default Credentials"
```

## 💡 Tips

1. **Usar `--format` para output personalizado:**
   ```bash
   gcloud run services list --format="table(name,status.url,status.conditions[0].status)"
   ```

2. **Guardar output en archivo:**
   ```bash
   gcloud run services describe bancamia-dataexpress-api \
     --region=southamerica-east1 > service-info.yaml
   ```

3. **Usar `--quiet` para no pedir confirmación:**
   ```bash
   gcloud run services update bancamia-dataexpress-api \
     --region=southamerica-east1 \
     --update-env-vars="KEY=value" \
     --quiet
   ```

