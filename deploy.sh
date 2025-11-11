#!/bin/bash

# ============================================
# Script de Despliegue Rápido a Cloud Run
# ============================================

set -e

echo "🚀 Desplegando bancamia-dataexpress-api a Cloud Run..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
# IMPORTANTE: Este es el PROJECT_ID de Google Cloud (con "test1")
# Firebase usa "bancamia-dataexpress-test" (sin el "1")
PROJECT_ID="bancamia-dataexpress-test1"
SERVICE_NAME="bancamia-dataexpress-api"
REGION="us-central1"

echo -e "${BLUE}📦 Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID

echo ""
echo -e "${BLUE}🔧 Habilitando APIs necesarias...${NC}"
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

echo ""
echo -e "${BLUE}🏗️  Construyendo y desplegando...${NC}"
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=bancamia-dataexpress-test,FIREBASE_API_KEY=AIzaSyDM6dgLBJrqzSwdXUiDIFiSybkWVNkSJ4o,FIREBASE_AUTH_DOMAIN=bancamia-dataexpress-test.firebaseapp.com,FIREBASE_STORAGE_BUCKET=bancamia-dataexpress-test.firebasestorage.app,FIREBASE_MESSAGING_SENDER_ID=533748472645,FIREBASE_APP_ID=1:533748472645:web:ffebad4f00b8009873fc2c,FIREBASE_MEASUREMENT_ID=G-E3NKWCQT0X"

echo ""
echo -e "${GREEN}✅ ¡Despliegue completado!${NC}"
echo ""
echo -e "${YELLOW}📍 Tu API está disponible en:${NC}"
gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
echo ""
echo -e "${YELLOW}🧪 Prueba tu API con:${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')
echo "curl $SERVICE_URL/api/v1/health"
echo "curl $SERVICE_URL/api/v1/users"
echo ""
echo -e "${GREEN}🎉 ¡Todo listo para producción!${NC}"

