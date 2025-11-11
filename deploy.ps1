# ============================================
# Script de Despliegue Rápido a Cloud Run (PowerShell)
# ============================================

Write-Host "`n🚀 Desplegando bancamia-dataexpress-api a Cloud Run..." -ForegroundColor Cyan

# Variables
$PROJECT_ID = "bancamia-dataexpress-test"
$SERVICE_NAME = "bancamia-dataexpress-api"
$REGION = "southamerica-east1"

Write-Host "`n📦 Configurando proyecto..." -ForegroundColor Blue
gcloud config set project $PROJECT_ID

Write-Host "`n🔧 Habilitando APIs necesarias..." -ForegroundColor Blue
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

Write-Host "`n🏗️  Construyendo y desplegando con configuraciones optimizadas..." -ForegroundColor Blue
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 1Gi `
  --cpu 2 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300 `
  --concurrency 80 `
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=bancamia-dataexpress-test,FIREBASE_API_KEY=AIzaSyDM6dgLBJrqzSwdXUiDIFiSybkWVNkSJ4o,FIREBASE_AUTH_DOMAIN=bancamia-dataexpress-test.firebaseapp.com,FIREBASE_STORAGE_BUCKET=bancamia-dataexpress-test.firebasestorage.app,FIREBASE_MESSAGING_SENDER_ID=533748472645,FIREBASE_APP_ID=1:533748472645:web:ffebad4f00b8009873fc2c,FIREBASE_MEASUREMENT_ID=G-E3NKWCQT0X"

Write-Host "`n✅ ¡Despliegue completado!" -ForegroundColor Green

Write-Host "`n📍 Tu API está disponible en:" -ForegroundColor Yellow
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
Write-Host $SERVICE_URL -ForegroundColor White

Write-Host "`n🧪 Prueba tu API con:" -ForegroundColor Yellow
Write-Host "curl $SERVICE_URL/api/v1/health" -ForegroundColor White
Write-Host "curl $SERVICE_URL/api/v1/users" -ForegroundColor White

Write-Host "`n🎉 ¡Todo listo para producción!`n" -ForegroundColor Green

