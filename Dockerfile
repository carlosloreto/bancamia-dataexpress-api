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

# Exponer el puerto (Cloud Run establece PORT automáticamente)
# No hardcodear el puerto, Cloud Run lo asigna dinámicamente
EXPOSE 8080

# Variable de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar la aplicación
# Usar exec para que reciba señales SIGTERM correctamente
CMD ["node", "src/index.js"]

