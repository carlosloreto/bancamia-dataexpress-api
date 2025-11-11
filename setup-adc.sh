#!/bin/bash

# ============================================
# Script para Configurar ADC (Application Default Credentials)
# Método más seguro para Firebase Auth en Cloud Run
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables del proyecto
PROJECT_ID="bancamia-dataexpress-test"
SERVICE_NAME="bancamia-dataexpress-api"
REGION="southamerica-east1"
SERVICE_ACCOUNT_NAME="firebase-admin"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${BLUE}🔐 Configurando Application Default Credentials (ADC)${NC}"
echo -e "${BLUE}   Método más seguro para Firebase Auth${NC}"
echo ""

# Paso 1: Configurar proyecto
echo -e "${YELLOW}📦 Paso 1: Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ Proyecto configurado: ${PROJECT_ID}${NC}"
echo ""

# Paso 2: Verificar si la cuenta de servicio ya existe
echo -e "${YELLOW}🔍 Paso 2: Verificando cuenta de servicio...${NC}"
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID &>/dev/null; then
    echo -e "${GREEN}✅ La cuenta de servicio ya existe: ${SERVICE_ACCOUNT_EMAIL}${NC}"
else
    echo -e "${BLUE}📝 Creando cuenta de servicio...${NC}"
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="Firebase Admin Service Account" \
        --description="Cuenta de servicio para Firebase Admin SDK en Cloud Run" \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✅ Cuenta de servicio creada: ${SERVICE_ACCOUNT_EMAIL}${NC}"
fi
echo ""

# Paso 3: Otorgar permisos de Firebase Admin
echo -e "${YELLOW}🔑 Paso 3: Otorgando permisos de Firebase Admin...${NC}"

# Verificar si ya tiene el rol
if gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --format="table(bindings.role)" | grep -q "roles/firebase.admin"; then
    echo -e "${GREEN}✅ La cuenta ya tiene permisos de Firebase Admin${NC}"
else
    echo -e "${BLUE}📝 Otorgando rol de Firebase Admin...${NC}"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/firebase.admin" \
        --condition=None
    
    echo -e "${GREEN}✅ Permisos otorgados${NC}"
fi
echo ""

# Paso 4: Asociar cuenta de servicio a Cloud Run
echo -e "${YELLOW}🚀 Paso 4: Asociando cuenta de servicio a Cloud Run...${NC}"

# Verificar si el servicio existe
if gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo -e "${BLUE}📝 Actualizando servicio Cloud Run...${NC}"
    gcloud run services update $SERVICE_NAME \
        --service-account=$SERVICE_ACCOUNT_EMAIL \
        --region=$REGION \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✅ Servicio actualizado con cuenta de servicio${NC}"
else
    echo -e "${RED}⚠️  El servicio Cloud Run no existe aún.${NC}"
    echo -e "${YELLOW}   Ejecuta el despliegue primero con: ./deploy.sh${NC}"
    echo -e "${YELLOW}   O agrega --service-account=${SERVICE_ACCOUNT_EMAIL} al comando de despliegue${NC}"
fi
echo ""

# Paso 5: Actualizar cloudbuild.yaml
echo -e "${YELLOW}📝 Paso 5: Actualizando cloudbuild.yaml...${NC}"
if grep -q "service-account" cloudbuild.yaml; then
    echo -e "${GREEN}✅ cloudbuild.yaml ya tiene la configuración de service-account${NC}"
else
    echo -e "${BLUE}📝 Agregando configuración de service-account a cloudbuild.yaml...${NC}"
    # Crear backup
    cp cloudbuild.yaml cloudbuild.yaml.backup
    
    # Agregar --service-account después de --concurrency
    sed -i.bak "s/--concurrency=80/--concurrency=80\n      - '--service-account=${SERVICE_ACCOUNT_EMAIL}'/" cloudbuild.yaml
    
    echo -e "${GREEN}✅ cloudbuild.yaml actualizado${NC}"
    echo -e "${YELLOW}   Backup guardado en: cloudbuild.yaml.backup${NC}"
fi
echo ""

# Resumen
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Resumen:${NC}"
echo -e "   Proyecto: ${PROJECT_ID}"
echo -e "   Cuenta de servicio: ${SERVICE_ACCOUNT_EMAIL}"
echo -e "   Servicio Cloud Run: ${SERVICE_NAME}"
echo -e "   Región: ${REGION}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo -e "   1. El código ya está configurado para usar ADC automáticamente"
echo -e "   2. NO necesitas definir FIREBASE_SERVICE_ACCOUNT en Cloud Run"
echo -e "   3. Solo asegúrate de tener FIREBASE_PROJECT_ID como variable de entorno"
echo -e "   4. En el próximo despliegue, ADC funcionará automáticamente"
echo ""
echo -e "${GREEN}🎉 ¡Todo listo! El método más seguro está configurado.${NC}"

