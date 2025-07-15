#!/bin/bash

echo "🚀 Iniciando servidor YouTube Transcript API..."

# Verificar si yt-dlp está instalado
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp no está instalado"
    echo "💡 Instálalo con: pip install yt-dlp"
    exit 1
fi

echo "✅ yt-dlp encontrado: $(yt-dlp --version)"

# Crear directorio temp si no existe
mkdir -p temp

# Iniciar servidor
echo "🔄 Iniciando servidor en puerto 3000..."
npm run dev
