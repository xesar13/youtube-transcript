const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Directorio temporal para archivos de subtítulos
const TEMP_DIR = path.join(__dirname, '../temp');

// Asegurar que el directorio temporal existe
fs.ensureDirSync(TEMP_DIR);

/**
 * Extrae el ID del video de una URL de YouTube
 * @param {string} url - URL del video de YouTube
 * @returns {string} - ID del video
 */
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Verifica si yt-dlp está instalado
 * @returns {Promise<boolean>}
 */
async function checkYtDlpInstallation() {
  try {
    await execAsync('yt-dlp --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene información básica del video
 * @param {string} videoId - ID del video de YouTube
 * @returns {Promise<object>} - Información del video
 */
async function getVideoInfo(videoId) {
  const isInstalled = await checkYtDlpInstallation();
  if (!isInstalled) {
    throw new Error('yt-dlp no está instalado. Por favor instálalo con: pip install yt-dlp');
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    const command = `yt-dlp --print "%(title)s|%(duration)s|%(uploader)s|%(upload_date)s" "${url}"`;
    const { stdout } = await execAsync(command);
    
    const [title, duration, uploader, uploadDate] = stdout.trim().split('|');
    
    return {
      videoId,
      title: title || 'Sin título',
      duration: duration || 'Desconocida',
      uploader: uploader || 'Desconocido',
      uploadDate: uploadDate || 'Desconocida',
      url
    };
  } catch (error) {
    throw new Error(`Error obteniendo información del video: ${error.message}`);
  }
}

/**
 * Obtiene metadatos completos del video para incluir en las respuestas
 * @param {string} videoId - ID del video de YouTube
 * @returns {Promise<object>} - Metadatos completos del video
 */
async function getVideoMetadata(videoId) {
  const isInstalled = await checkYtDlpInstallation();
  if (!isInstalled) {
    throw new Error('yt-dlp no está instalado. Por favor instálalo con: pip install yt-dlp');
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    // Obtener metadatos completos en formato JSON
    const command = `yt-dlp -j "${url}"`;
    const { stdout } = await execAsync(command);
    
    const metadata = JSON.parse(stdout.trim());
    
    // Extraer y formatear la información relevante
    return {
      videoId: metadata.id || videoId,
      title: metadata.title || 'Sin título',
      description: metadata.description || '',
      channel: metadata.uploader || metadata.channel || 'Desconocido',
      channelId: metadata.uploader_id || metadata.channel_id || '',
      channelUrl: metadata.uploader_url || metadata.channel_url || '',
      duration: metadata.duration || 0,
      durationFormatted: formatDuration(metadata.duration || 0),
      uploadDate: formatDate(metadata.upload_date || ''),
      viewCount: metadata.view_count || 0,
      likeCount: metadata.like_count || 0,
      commentCount: metadata.comment_count || 0,
      tags: metadata.tags || [],
      categories: metadata.categories || [],
      thumbnailUrl: metadata.thumbnail || '',
      language: metadata.language || 'es',
      availability: metadata.availability || 'public',
      ageLimit: metadata.age_limit || 0
    };
  } catch (error) {
    console.error('Error obteniendo metadatos completos:', error);
    // Fallback a información básica si falla la extracción completa
    try {
      const basicInfo = await getVideoInfo(videoId);
      return {
        videoId: basicInfo.videoId,
        title: basicInfo.title,
        description: '',
        channel: basicInfo.uploader,
        channelId: '',
        channelUrl: '',
        duration: parseInt(basicInfo.duration) || 0,
        durationFormatted: formatDuration(parseInt(basicInfo.duration) || 0),
        uploadDate: formatDate(basicInfo.uploadDate),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        tags: [],
        categories: [],
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        language: 'es',
        availability: 'public',
        ageLimit: 0
      };
    } catch (fallbackError) {
      throw new Error(`Error obteniendo información del video: ${error.message}`);
    }
  }
}

/**
 * Formatea la duración de segundos a HH:MM:SS
 * @param {number} seconds - Duración en segundos
 * @returns {string} - Duración formateada
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Formatea la fecha de YYYYMMDD a YYYY-MM-DD
 * @param {string} dateStr - Fecha en formato YYYYMMDD
 * @returns {string} - Fecha formateada
 */
function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return '';
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return `${year}-${month}-${day}`;
}

/**
 * Extrae la transcripción de un video de YouTube
 * @param {string} url - URL del video de YouTube
 * @param {string} lang - Idioma de los subtítulos (por defecto 'es')
 * @returns {Promise<object>} - Transcripción extraída
 */
async function extractTranscript(url, lang = 'es') {
  const isInstalled = await checkYtDlpInstallation();
  if (!isInstalled) {
    throw new Error('yt-dlp no está instalado. Por favor instálalo con: pip install yt-dlp');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('URL de YouTube no válida');
  }

  const outputPath = path.join(TEMP_DIR, `${videoId}.${lang}`);
  
  try {
    // Comando yt-dlp para extraer subtítulos automáticos
    const command = `yt-dlp --write-auto-sub --sub-lang ${lang} --skip-download --output "${outputPath}" "${url}"`;
    
    console.log(`Ejecutando: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    // Buscar el archivo de subtítulos generado
    const subtitleFiles = await fs.readdir(TEMP_DIR);
    const subtitleFile = subtitleFiles.find(file => 
      file.startsWith(videoId) && file.includes(lang) && file.endsWith('.vtt')
    );
    
    if (!subtitleFile) {
      throw new Error(`No se encontraron subtítulos en ${lang} para este video`);
    }
    
    const subtitlePath = path.join(TEMP_DIR, subtitleFile);
    const subtitleContent = await fs.readFile(subtitlePath, 'utf-8');
     // Parsear el contenido VTT
    const transcript = parseVTTContent(subtitleContent);
    
    // Obtener metadatos del video
    const videoMetadata = await getVideoMetadata(videoId);
    
    // Limpiar archivo temporal
    await fs.remove(subtitlePath);

    return {
      videoId,
      language: lang,
      transcript,
      totalSegments: transcript.length,
      rawContent: subtitleContent,
      source: videoMetadata
    };
    
  } catch (error) {
    console.error('Error en extractTranscript:', error);
    throw new Error(`Error extrayendo transcripción: ${error.message}`);
  }
}

/**
 * Descarga archivos de subtítulos sin procesarlos
 * @param {string} url - URL del video de YouTube
 * @param {string} lang - Idioma de los subtítulos
 * @param {string} format - Formato del archivo (vtt, srt, etc.)
 * @returns {Promise<object>} - Información del archivo descargado
 */
async function downloadSubtitles(url, lang = 'es', format = 'vtt') {
  const isInstalled = await checkYtDlpInstallation();
  if (!isInstalled) {
    throw new Error('yt-dlp no está instalado. Por favor instálalo con: pip install yt-dlp');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('URL de YouTube no válida');
  }

  const outputPath = path.join(TEMP_DIR, `${videoId}.${lang}`);
  
  try {
    let command;
    if (format === 'srt') {
      command = `yt-dlp --write-auto-sub --sub-lang ${lang} --convert-subs srt --skip-download --output "${outputPath}" "${url}"`;
    } else {
      command = `yt-dlp --write-auto-sub --sub-lang ${lang} --skip-download --output "${outputPath}" "${url}"`;
    }
    
    console.log(`Ejecutando: ${command}`);
    await execAsync(command);
    
    // Buscar el archivo generado
    const subtitleFiles = await fs.readdir(TEMP_DIR);
    const subtitleFile = subtitleFiles.find(file => 
      file.startsWith(videoId) && file.includes(lang)
    );
    
    if (!subtitleFile) {
      throw new Error(`No se encontraron subtítulos en ${lang} para este video`);
    }
    
    const subtitlePath = path.join(TEMP_DIR, subtitleFile);
    const fileStats = await fs.stat(subtitlePath);
    
    return {
      videoId,
      language: lang,
      format,
      fileName: subtitleFile,
      filePath: subtitlePath,
      fileSize: fileStats.size,
      downloadedAt: new Date().toISOString()
    };
    
  } catch (error) {
    throw new Error(`Error descargando subtítulos: ${error.message}`);
  }
}

/**
 * Parsea el contenido de un archivo VTT y extrae el texto
 * @param {string} vttContent - Contenido del archivo VTT
 * @returns {Array} - Array de objetos con timestamp y texto
 */
function parseVTTContent(vttContent) {
  const lines = vttContent.split('\n');
  const transcript = [];
  let currentSegment = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Buscar líneas de timestamp (formato: 00:00:00.000 --> 00:00:03.000)
    if (line.includes('-->')) {
      const [startTime, endTime] = line.split('-->').map(t => t.trim());
      currentSegment = {
        startTime,
        endTime,
        text: ''
      };
    } else if (line && currentSegment && !line.startsWith('WEBVTT') && !line.includes('-->')) {
      // Es una línea de texto
      if (currentSegment.text) {
        currentSegment.text += ' ';
      }
      currentSegment.text += line.replace(/<[^>]*>/g, ''); // Remover tags HTML
      
      // Si la siguiente línea está vacía o es un timestamp, finalizar el segmento
      if (i + 1 >= lines.length || !lines[i + 1].trim() || lines[i + 1].includes('-->')) {
        if (currentSegment.text.trim()) {
          transcript.push(currentSegment);
        }
        currentSegment = null;
      }
    }
  }
  
  return transcript;
}

/**
 * Limpia archivos temporales antiguos
 * @param {number} maxAgeHours - Edad máxima en horas
 */
async function cleanupTempFiles(maxAgeHours = 24) {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > maxAgeHours) {
        await fs.remove(filePath);
        console.log(`Archivo temporal eliminado: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error limpiando archivos temporales:', error);
  }
}

// Limpiar archivos temporales al inicio
cleanupTempFiles();

module.exports = {
  extractTranscript,
  downloadSubtitles,
  getVideoInfo,
  getVideoMetadata,
  parseVTTContent,
  cleanupTempFiles,
  checkYtDlpInstallation
};
