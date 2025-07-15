const axios = require('axios');

// Función para probar la API
async function testAPI() {
  const baseURL = 'http://localhost:3003';
  
  try {
    // Test 1: Health check
    console.log('🔍 Probando health check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Extraer transcripción
    console.log('\n🔍 Probando extracción de transcripción...');
    const transcriptResponse = await axios.post(`${baseURL}/api/transcript/extract`, {
      url: 'https://www.youtube.com/watch?v=8cnF9pESLPc',
      lang: 'es'
    });
    
    console.log('✅ Transcripción extraída exitosamente!');
    console.log('📝 Primeros 3 segmentos:');
    transcriptResponse.data.transcript.slice(0, 3).forEach((segment, index) => {
      console.log(`${index + 1}. [${segment.startTime} - ${segment.endTime}] ${segment.text}`);
    });
    
    // Test 3: Extraer transcripción limpia (formato n8n)
    console.log('\n🔍 Probando extracción de transcripción limpia...');
    const cleanResponse = await axios.post(`${baseURL}/api/transcript/clean`, {
      url: 'https://www.youtube.com/watch?v=8cnF9pESLPc',
      lang: 'es'
    });
    
    console.log('✅ Transcripción limpia extraída!');
    console.log('📊 Estadísticas:');
    console.log(`   - Palabras: ${cleanResponse.data.wordCount}`);
    console.log(`   - Caracteres: ${cleanResponse.data.characterCount}`);
    console.log(`   - Segmentos: ${cleanResponse.data.totalSegments}`);
    console.log('📝 Texto limpio (primeros 200 caracteres):');
    console.log(`   "${cleanResponse.data.cleanedTranscript.substring(0, 200)}..."`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejecutar solo si el archivo se ejecuta directamente
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
