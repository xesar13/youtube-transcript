#!/bin/bash

# YouTube Transcript API - PM2 Deployment Script

echo "🚀 Iniciando YouTube Transcript API con PM2..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 no está instalado globalmente"
    log_info "Instalando PM2 globalmente..."
    npm install -g pm2
fi

# Verificar si yt-dlp está instalado
if ! command -v yt-dlp &> /dev/null; then
    log_error "yt-dlp no está instalado"
    log_info "Instálalo con: pip install yt-dlp"
    exit 1
fi

log_info "yt-dlp encontrado: $(yt-dlp --version)"

# Crear directorios necesarios
mkdir -p temp logs

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias..."
    npm install
fi

# Determinar el entorno
ENVIRONMENT=${1:-production}

case $ENVIRONMENT in
    "dev"|"development")
        log_info "Iniciando en modo desarrollo..."
        npm run pm2:start:dev
        ;;
    "staging")
        log_info "Iniciando en modo staging..."
        npm run pm2:start:staging
        ;;
    "production")
        log_info "Iniciando en modo producción..."
        npm run pm2:start
        ;;
    *)
        log_error "Entorno no válido. Usa: dev, staging o production"
        exit 1
        ;;
esac

# Mostrar status
sleep 2
npm run pm2:status

log_info "✅ YouTube Transcript API iniciada correctamente!"
log_info "📊 Para monitorear: npm run pm2:monit"
log_info "📋 Para ver logs: npm run pm2:logs"
log_info "🔄 Para reiniciar: npm run pm2:restart"
