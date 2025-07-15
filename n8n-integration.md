# Integración YouTube Transcript API con n8n

## Configuración rápida

### 1. HTTP Request Node
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/transcript/clean",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "url": "{{ $json.videoUrl }}",
    "lang": "es"
  }
}
```

### 2. Code Node (Procesamiento)
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

// El texto ya viene limpio de la API
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
    language: data.language,
    processedAt: new Date().toISOString()
  }
};
```

### 3. Manejo de errores
```javascript
const data = $input.first().json;

if (!data.success) {
  return {
    json: {
      error: true,
      message: data.message,
      videoUrl: data.videoUrl,
      timestamp: new Date().toISOString()
    }
  };
}

return { json: data };
```

## Importar workflow

1. Copia el contenido de `n8n-workflow.json`
2. En n8n, ve a **Workflows** → **Import from File**
3. Pega el JSON y guarda
4. Configura la URL de tu API si es diferente a `localhost:3000`

## Ejemplo de entrada

```json
{
  "videoUrl": "https://www.youtube.com/watch?v=8cnF9pESLPc"
}
```

## Ejemplo de salida

```json
{
  "success": true,
  "videoUrl": "https://www.youtube.com/watch?v=8cnF9pESLPc",
  "videoId": "8cnF9pESLPc",
  "cleanedTranscript": "Texto completo de la transcripción limpio y procesado...",
  "wordCount": 1250,
  "characterCount": 7845,
  "language": "es",
  "processedAt": "2025-07-15T10:30:00.000Z"
}
```
