const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const transcriptRoutes = require('./routes/transcript');

const app = express();
const PORT = process.env.PORT || 3003;

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
fs.ensureDirSync(logsDir);

// Setup logging for PM2
const logStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

// Middleware
app.use(helmet());
app.use(cors());

// Configure morgan for different environments
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: logStream }));
} else {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/transcript', transcriptRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'YouTube Transcript API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📋 Health check en http://localhost:${PORT}/health`);
  console.log(`📝 API de transcripciones en http://localhost:${PORT}/api/transcript`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Proceso ID: ${process.pid}`);
});

// Graceful shutdown para PM2
const gracefulShutdown = (signal) => {
  console.log(`\n📤 Recibida señal ${signal}. Cerrando servidor gracefully...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error al cerrar el servidor:', err);
      process.exit(1);
    }
    
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Forzando cierre del servidor...');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle PM2 graceful reload
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    gracefulShutdown('PM2');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
