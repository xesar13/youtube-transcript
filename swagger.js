const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Cargar el archivo OpenAPI YAML
const openApiPath = path.join(__dirname, 'openapi.yaml');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

// Configuración de Swagger UI
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 8px; }
    .swagger-ui .opblock.opblock-post { border-color: #10b981; }
    .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
    .swagger-ui .opblock-summary-post { border-color: #10b981; }
    .swagger-ui .opblock-summary-get { border-color: #3b82f6; }
  `,
  customSiteTitle: 'YouTube Transcript API - Documentación',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    displayOperationId: false,
    tryItOutEnabled: true
  }
};

// Función para configurar Swagger en la aplicación Express
function setupSwagger(app) {
  // Actualizar la URL del servidor según el entorno
  if (process.env.NODE_ENV === 'production') {
    openApiSpec.servers = [
      {
        url: process.env.PRODUCTION_URL || 'https://api.example.com',
        description: 'Servidor de producción'
      },
      {
        url: `http://localhost:${process.env.PORT || 3003}`,
        description: 'Servidor local'
      }
    ];
  } else {
    openApiSpec.servers = [
      {
        url: `http://localhost:${process.env.PORT || 3003}`,
        description: 'Servidor de desarrollo'
      }
    ];
  }

  // Configurar rutas de documentación
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerOptions));
  
  // Endpoint para obtener el spec en JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });

  // Endpoint para obtener el spec en YAML
  app.get('/api-docs.yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(yaml.dump(openApiSpec));
  });

  // Ruta de redirección para facilitar el acceso
  app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
  });

  console.log(`📚 Documentación Swagger disponible en:`);
  console.log(`   http://localhost:${process.env.PORT || 3003}/api-docs`);
  console.log(`   http://localhost:${process.env.PORT || 3003}/docs`);
}

module.exports = {
  setupSwagger,
  openApiSpec
};
