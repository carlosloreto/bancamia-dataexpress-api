# ============================================
# Dockerfile para API Express en Cloud Run
# ============================================

# Usar imagen oficial de Node.js LTS
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto (Cloud Run usa PORT env var)
EXPOSE 3000

# Variable de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"]

