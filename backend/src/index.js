import express from 'express';
import cors from 'cors';
import { config, initConfig } from './config.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';
import sessionsRouter from './routes/sessions.js';
import evolutionRouter from './routes/evolution.js';

const app = express();

// Enable CORS with origin restriction
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parsing with size limit
app.use(express.json({ limit: '2mb' }));

// General Rate Limiting
app.use('/api/', apiRateLimiter);

// Route Mounting
app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/evolution', evolutionRouter);

// Centralized Error Handling (Must be mounted last)
app.use(errorHandler);

// Server startup
export async function startServer() {
  await initConfig();
  
  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`  MindLoom AI Backend Server Running on Port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Secret Manager Enabled: ${config.useSecretManager}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server Startup Error] Port ${config.port} is already in use by another process.`);
      console.error(`Please stop the process using port ${config.port} or set PORT environment variable (e.g. $env:PORT=8081).`);
    } else {
      console.error(`[Server Startup Error] ${err.message}`);
    }
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  });
}

export default app;
