# YouTube Transcript API

Una API de Node.js para extraer transcripciones de videos de YouTube utilizando `yt-dlp`.

## 🚀 Características

- ✅ Extracción de transcripciones automáticas de YouTube
- ✅ Soporte para múltiples idiomas
- ✅ API REST con endpoints claros
- ✅ **Gestión avanzada con PM2** (clustering, auto-restart, logs)
- ✅ **Graceful shutdown** para deploys sin downtime
- ✅ Descarga de archivos de subtítulos en diferentes formatos
- ✅ Limpieza automática de archivos temporales
- ✅ Validación de URLs de YouTube
- ✅ Manejo robusto de errores
- ✅ **Integración optimizada con n8n**

## 📋 Requisitos previos

1. **Node.js** (versión 14 o superior)
2. **yt-dlp** instalado globalmente:
   ```bash
   pip install yt-dlp
   ```

## 🛠️ Instalación

1. Clona o descarga el proyecto
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo de configuración:
   ```bash
   cp .env.example .env
   ```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción con PM2 (Recomendado)
```bash
# Instalación rápida
./deploy.sh production

# O manualmente
npm run pm2:start
```

### Otros comandos de PM2
```bash
# Iniciar en modo desarrollo
npm run pm2:start:dev

# Ver estado de procesos
npm run pm2:status

# Ver logs en tiempo real
npm run pm2:logs

# Reiniciar aplicación
npm run pm2:restart

# Detener aplicación
npm run pm2:stop

# Monitor en tiempo real
npm run pm2:monit
```

### Producción tradicional
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3003`

## 📚 API Endpoints

### Health Check
```http
GET /health
```

### Extraer transcripción
```http
POST /api/transcript/extract
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "lang": "es"
}
```

**Respuesta:**
```json
{
  "success": true,
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "es",
  "transcript": [
    {
      "startTime": "00:00:00.000",
      "endTime": "00:00:03.000",
      "text": "Texto de la transcripción..."
    }
  ]
}
```

### Extraer transcripción limpia (Compatible con n8n)
```http
POST /api/transcript/clean
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "lang": "es"
}
```

**Respuesta:**
```json
{
  "success": true,
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "videoId": "VIDEO_ID",
  "language": "es",
  "cleanedTranscript": "Texto completo de la transcripción limpio y procesado...",
  "wordCount": 1250,
  "characterCount": 7845,
  "totalSegments": 145
}
```

### Descargar archivos de subtítulos
```http
POST /api/transcript/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "lang": "es",
  "format": "vtt"
}
```

### Obtener información del video
```http
GET /api/transcript/info/VIDEO_ID
```

### Obtener idiomas disponibles
```http
GET /api/transcript/languages/VIDEO_ID
```

## 🌍 Idiomas soportados

- `es` - Español
- `en` - Inglés
- `fr` - Francés
- `de` - Alemán
- `it` - Italiano
- `pt` - Portugués
- Y muchos más...

## 📁 Estructura del proyecto

```
youtube-transcript/
├── index.js                 # Servidor principal
├── routes/
│   └── transcript.js        # Rutas de la API
├── services/
│   └── transcriptService.js # Lógica de negocio
├── temp/                    # Archivos temporales
├── .env                     # Variables de entorno
├── .gitignore              # Archivos ignorados por Git
└── package.json            # Configuración del proyecto
```

## ⚙️ Configuración

Variables de entorno disponibles en `.env`:

```env
PORT=3000
DEFAULT_LANGUAGE=es
MAX_FILE_AGE_HOURS=24
LOG_LEVEL=info
```

## 🔧 Comando yt-dlp utilizado

La API utiliza el siguiente comando base:

```bash
yt-dlp --write-auto-sub --sub-lang es --skip-download "URL_DEL_VIDEO"
```

## 🚨 Manejo de errores

La API maneja varios tipos de errores:

- URLs de YouTube inválidas
- Videos sin subtítulos disponibles
- Errores de yt-dlp
- Idiomas no disponibles
- Errores de red

## 🧹 Limpieza automática

Los archivos temporales se limpian automáticamente cada 24 horas para evitar acumulación de archivos.

## 📝 Ejemplos de uso

### Con curl
```bash
# Extraer transcripción en español
curl -X POST http://localhost:3003/api/transcript/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=8cnF9pESLPc", "lang": "es"}'

# Extraer transcripción limpia (recomendado para n8n)
curl -X POST http://localhost:3003/api/transcript/clean \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=8cnF9pESLPc", "lang": "es"}'

# Obtener información del video
curl http://localhost:3003/api/transcript/info/8cnF9pESLPc
```

### Con JavaScript (fetch)
```javascript
// Extraer transcripción limpia (recomendado)
const response = await fetch('http://localhost:3003/api/transcript/clean', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.youtube.com/watch?v=8cnF9pESLPc',
    lang: 'es'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Texto limpio:', data.cleanedTranscript);
  console.log('Palabras:', data.wordCount);
} else {
  console.error('Error:', data.message);
}
```

### Ejemplo de respuesta limpia
```json
{
  "success": true,
  "videoUrl": "https://www.youtube.com/watch?v=8cnF9pESLPc",
  "videoId": "8cnF9pESLPc",
  "language": "es",
  "cleanedTranscript": "Hola, bienvenidos a este video donde vamos a hablar sobre inteligencia artificial y cómo está transformando nuestra sociedad...",
  "wordCount": 1250,
  "characterCount": 7845,
  "totalSegments": 145
}
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## ⚠️ Disclaimer

Esta herramienta es para uso educativo y de investigación. Respeta los términos de servicio de YouTube y las leyes de derechos de autor aplicables.

## 🧪 Pruebas

Para probar la API después de iniciarla, puedes usar:

```bash
# Ejecutar script de prueba
node test-api.js
```

O probar manualmente con curl:

```bash
# Health check
curl http://localhost:3003/health

# Extraer transcripción
curl -X POST http://localhost:3003/api/transcript/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=8cnF9pESLPc", "lang": "es"}'
```

## 🔧 Solución de problemas

### Error: "yt-dlp no está instalado"
```bash
pip install yt-dlp
# o con pip3
pip3 install yt-dlp
```

### Error: "address already in use"
```bash
# Liberar el puerto 3003
lsof -ti:3003 | xargs kill -9
```

### Error con Express 5.x
El proyecto usa Express 4.x para mejor estabilidad. Si tienes problemas:
```bash
npm uninstall express
npm install express@4.19.2
```

### Verificar instalación
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar yt-dlp
yt-dlp --version
```

### Error con PM2: "Process not found"
```bash
# Ver procesos activos
npm run pm2:status

# Si no hay procesos, iniciar
npm run pm2:start

# Si hay problemas, eliminar y reiniciar
npm run pm2:delete
npm run pm2:start
```

### Logs de PM2 no aparecen
```bash
# Verificar configuración de logs
pm2 describe youtube-transcript-api

# Ver logs directamente
tail -f logs/combined.log
```

### Alto uso de memoria
```bash
# El proceso se reinicia automáticamente en 1GB
# Verificar en el monitor
npm run pm2:monit

# O reiniciar manualmente
npm run pm2:restart
```

## 🔗 Integración con n8n

Esta API está diseñada para integrarse fácilmente con n8n. Usa el endpoint `/api/transcript/clean` para obtener texto procesado y limpio.

### Configuración en n8n:

1. **HTTP Request Node:**
   ```json
   {
     "method": "POST",
     "url": "http://localhost:3003/api/transcript/clean",
     "headers": {
       "Content-Type": "application/json"
     },
     "body": {
       "url": "{{$json.videoUrl}}",
       "lang": "es"
     }
   }
   ```

2. **Código de procesamiento (si necesitas más limpieza):**
   ```javascript
   // Extract and process the transcript
   const data = $input.first().json;

   if (!data.success || !data.cleanedTranscript) {
     return {
       json: {
         success: false,
         message: data.message || 'No transcript available for this video',
         videoUrl: data.videoUrl || 'Unknown'
       }
     };
   }

   // El texto ya viene limpio de la API, pero puedes procesarlo más
   const finalTranscript = data.cleanedTranscript
     .replace(/\s+/g, ' ')
     .replace(/\s([.,!?])/g, '$1')
     .trim();

   return {
     json: {
       success: true,
       videoUrl: data.videoUrl,
       videoId: data.videoId,
       cleanedTranscript: finalTranscript,
       wordCount: data.wordCount,
       characterCount: data.characterCount,
       language: data.language
     }
   };
   ```

3. **Manejo de errores en n8n:**
   ```javascript
   const data = $input.first().json;
   
   if (!data.success) {
     return {
       json: {
         error: true,
         message: data.message,
         videoUrl: data.videoUrl
       }
     };
   }
   
   return { json: data };
   ```

### Endpoints recomendados para n8n:
- **`/api/transcript/clean`** - Para obtener solo el texto limpio
- **`/health`** - Para verificar que la API esté funcionando

## 🔧 Gestión con PM2

PM2 es un gestor de procesos avanzado para aplicaciones Node.js que proporciona:

- ✅ **Reinicio automático** en caso de crashes
- ✅ **Clustering** para aprovechar múltiples CPU cores
- ✅ **Logs centralizados** con rotación automática
- ✅ **Monitoring** en tiempo real
- ✅ **Graceful shutdown/reload** sin downtime
- ✅ **Startup scripts** para auto-inicio del sistema

### Configuración PM2

El archivo `ecosystem.config.js` contiene toda la configuración:

```javascript
{
  "name": "youtube-transcript-api",
  "script": "index.js",
  "instances": 1,
  "exec_mode": "cluster",
  "max_memory_restart": "1G",
  "autorestart": true,
  "cron_restart": "0 2 * * *"  // Reinicio diario a las 2 AM
}
```

### Comandos PM2 disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run pm2:start` | Iniciar en producción |
| `npm run pm2:start:dev` | Iniciar en desarrollo |
| `npm run pm2:restart` | Reiniciar aplicación |
| `npm run pm2:reload` | Reload sin downtime |
| `npm run pm2:stop` | Detener aplicación |
| `npm run pm2:delete` | Eliminar proceso de PM2 |
| `npm run pm2:logs` | Ver logs en tiempo real |
| `npm run pm2:monit` | Monitor de recursos |
| `npm run pm2:status` | Estado de procesos |
| `npm run pm2:save` | Guardar configuración actual |

### Deployment automático

```bash
# Desarrollo
./deploy.sh dev

# Staging
./deploy.sh staging

# Producción
./deploy.sh production
```

### Logs con PM2

Los logs se guardan automáticamente en:
- `logs/out.log` - Output estándar
- `logs/err.log` - Errores
- `logs/combined.log` - Logs combinados
- `logs/access.log` - Logs de acceso HTTP

### Auto-inicio del sistema

Para que la API se inicie automáticamente al arrancar el servidor:

```bash
# Guardar la configuración actual
npm run pm2:save

# Generar script de startup
pm2 startup

# Seguir las instrucciones mostradas
```
