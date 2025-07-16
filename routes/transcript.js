const express = require('express');
const { extractTranscript, downloadSubtitles, getVideoInfo } = require('../services/transcriptService');

const router = express.Router();

// GET /api/transcript/info/:videoId - Obtener información del video
router.get('/info/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({
        error: 'Video ID es requerido'
      });
    }

    const videoInfo = await getVideoInfo(videoId);
    res.json(videoInfo);
  } catch (error) {
    console.error('Error obteniendo información del video:', error);
    res.status(500).json({
      error: 'Error obteniendo información del video',
      message: error.message
    });
  }
});

// POST /api/transcript/extract - Extraer transcripción de un video
router.post('/extract', async (req, res) => {
  try {
    const { url, lang = 'es' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL del video es requerida'
      });
    }

    // Validar que sea una URL de YouTube válida
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({
        error: 'URL de YouTube no válida'
      });
    }

    const result = await extractTranscript(url, lang);
    res.json({
      success: true,
      url,
      language: lang,
      transcript: result.transcript,
      source: result.source
    });
  } catch (error) {
    console.error('Error extrayendo transcripción:', error);
    res.status(500).json({
      error: 'Error extrayendo transcripción',
      message: error.message
    });
  }
});

// POST /api/transcript/download - Descargar archivos de subtítulos
router.post('/download', async (req, res) => {
  try {
    const { url, lang = 'es', format = 'vtt' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL del video es requerida'
      });
    }

    const result = await downloadSubtitles(url, lang, format);
    res.json({
      success: true,
      url,
      language: lang,
      format,
      ...result
    });
  } catch (error) {
    console.error('Error descargando subtítulos:', error);
    res.status(500).json({
      error: 'Error descargando subtítulos',
      message: error.message
    });
  }
});

// GET /api/transcript/languages/:videoId - Obtener idiomas disponibles
router.get('/languages/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({
        error: 'Video ID es requerido'
      });
    }

    // Este endpoint requeriría una implementación adicional para listar idiomas disponibles
    res.json({
      message: 'Funcionalidad en desarrollo',
      videoId,
      availableLanguages: ['es', 'en', 'fr', 'de', 'it', 'pt']
    });
  } catch (error) {
    console.error('Error obteniendo idiomas:', error);
    res.status(500).json({
      error: 'Error obteniendo idiomas disponibles',
      message: error.message
    });
  }
});

// POST /api/transcript/clean - Extraer transcripción limpia (compatible con n8n)
router.post('/clean', async (req, res) => {
  try {
    const { url, lang = 'es' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL del video es requerida',
        videoUrl: url || 'Unknown'
      });
    }

    // Validar que sea una URL de YouTube válida
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'URL de YouTube no válida',
        videoUrl: url
      });
    }

    const result = await extractTranscript(url, lang);
    
    if (!result.transcript || result.transcript.length === 0) {
      return res.json({
        success: false,
        message: 'No transcript available for this video',
        videoUrl: url
      });
    }

    // Process the transcript text
    let transcriptText = '';

    // Extract text from segments
    if (Array.isArray(result.transcript)) {
      result.transcript.forEach(segment => {
        if (segment.text) {
          transcriptText += segment.text + ' ';
        }
      });
    }

    // Clean up the transcript (remove extra spaces, normalize punctuation)
    const cleanedTranscript = transcriptText
      .replace(/\s+/g, ' ')
      .replace(/\s([.,!?])/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    res.json({
      success: true,
      videoUrl: url,
      videoId: result.videoId,
      language: lang,
      cleanedTranscript,
      wordCount: cleanedTranscript.split(' ').length,
      characterCount: cleanedTranscript.length,
      totalSegments: result.totalSegments,
      source: result.source
    });

  } catch (error) {
    console.error('Error extrayendo transcripción limpia:', error);
    res.status(500).json({
      success: false,
      message: 'Error extrayendo transcripción',
      error: error.message,
      videoUrl: req.body.url || 'Unknown'
    });
  }
});

module.exports = router;
