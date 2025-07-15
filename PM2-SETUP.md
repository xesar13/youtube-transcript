# PM2 Setup Guide - YouTube Transcript API

## Instalación rápida

### 1. Prerrequisitos
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalación
pm2 --version
```

### 2. Iniciar la aplicación
```bash
# Opción 1: Script automático
./deploy.sh production

# Opción 2: Comandos manuales
npm install
npm run pm2:start
```

### 3. Verificar que funciona
```bash
# Ver procesos
pm2 status

# Ver logs
pm2 logs youtube-transcript-api

# Probar API
curl http://localhost:3000/health
```

## Comandos útiles de PM2

### Gestión básica
```bash
pm2 start ecosystem.config.js          # Iniciar
pm2 restart youtube-transcript-api     # Reiniciar
pm2 stop youtube-transcript-api        # Detener
pm2 delete youtube-transcript-api      # Eliminar
pm2 reload youtube-transcript-api      # Reload sin downtime
```

### Monitoreo
```bash
pm2 status                             # Estado general
pm2 monit                              # Monitor en tiempo real
pm2 logs youtube-transcript-api        # Ver logs
pm2 logs youtube-transcript-api --lines 100  # Últimas 100 líneas
```

### Configuración de startup
```bash
pm2 save                               # Guardar configuración actual
pm2 startup                            # Generar script de inicio automático
# Ejecutar el comando que PM2 te proporcione
```

## Estructura de archivos

```
youtube-transcript/
├── ecosystem.config.js     # Configuración PM2
├── deploy.sh              # Script de deployment
├── logs/                  # Logs de aplicación
│   ├── access.log         # Logs HTTP
│   ├── combined.log       # Logs combinados PM2
│   ├── err.log           # Errores PM2
│   └── out.log           # Output PM2
└── temp/                 # Archivos temporales
```

## Configuración de producción

### Variables de entorno
```bash
# En .env
NODE_ENV=production
PORT=3000
```

### Clustering (opcional)
Para aprovechar múltiples CPU cores, modifica `ecosystem.config.js`:
```javascript
{
  "instances": "max",  // Usar todos los cores disponibles
  "exec_mode": "cluster"
}
```

## Troubleshooting

### Error: "PM2 not found"
```bash
npm install -g pm2
```

### Error: "Process not found"
```bash
pm2 delete all
npm run pm2:start
```

### Puerto ocupado
```bash
pm2 stop all
lsof -ti:3000 | xargs kill -9
npm run pm2:start
```

### Logs no aparecen
```bash
# Verificar configuración
pm2 describe youtube-transcript-api

# Ver logs directamente
tail -f logs/combined.log
```

## Auto-restart en crash

PM2 automáticamente reinicia la aplicación si:
- La aplicación crash
- Usa más de 1GB de memoria
- Cada día a las 2 AM (cron_restart)

## Backup y restore

```bash
# Guardar configuración
pm2 save

# En otro servidor, restaurar
pm2 resurrect
```
