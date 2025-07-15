<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# YouTube Transcript API - Instrucciones para Copilot

Este proyecto es una API de Node.js que utiliza `yt-dlp` para extraer transcripciones de videos de YouTube.

## Arquitectura del proyecto

- **Backend**: Node.js con Express
- **Herramienta externa**: yt-dlp para descarga de subtítulos
- **Estructura**: 
  - `index.js`: Servidor principal
  - `routes/`: Definición de endpoints
  - `services/`: Lógica de negocio
  - `temp/`: Archivos temporales de subtítulos

## Convenciones de código

- Usar JavaScript ES6+ con require/module.exports
- Manejo de errores con try/catch y middleware de Express
- Funciones asíncronas con async/await
- Validación de entrada en routes
- Logging con morgan y console
- Limpieza automática de archivos temporales

## Comandos importantes

- `npm run dev`: Desarrollo con nodemon
- `npm start`: Producción
- Requiere `yt-dlp` instalado: `pip install yt-dlp`

## Endpoints principales

- `POST /api/transcript/extract`: Extraer transcripción con timestamps
- `POST /api/transcript/clean`: Extraer transcripción limpia (optimizado para n8n)
- `POST /api/transcript/download`: Descargar archivos de subtítulos
- `GET /api/transcript/info/:videoId`: Información del video
- `GET /health`: Health check

## Integración con n8n

- El endpoint `/api/transcript/clean` está optimizado para n8n
- Devuelve texto limpio, procesado y estadísticas
- Incluye manejo de errores compatible con workflows
- Ver `n8n-integration.md` para ejemplos completos

## Consideraciones de seguridad

- Validación de URLs de YouTube
- Limpieza de archivos temporales
- Headers de seguridad con helmet
- CORS configurado
