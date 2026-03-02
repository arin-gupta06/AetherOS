const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const mongoose = require('mongoose');

const environmentRoutes = require('./routes/environments');
const inferenceRoutes = require('./routes/inference');
const rulesRoutes = require('./routes/rules');
const simulationRoutes = require('./routes/simulation');
const cbctRoutes = require('./routes/cbct');
const eventRoutes = require('./routes/events');

const { broadcastEvent } = require('./ws/broadcast');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('[WS] Client connected. Total:', clients.size);
  ws.on('close', () => {
    clients.delete(ws);
    console.log('[WS] Client disconnected. Total:', clients.size);
  });
});

// Make broadcast available globally
app.set('wsClients', clients);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/environments', environmentRoutes);
app.use('/api/inference', inferenceRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/cbct', cbctRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', platform: 'AetherOS', version: '1.0.0' });
});

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aetheros';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Connected to MongoDB');
  } catch (err) {
    console.warn('[DB] MongoDB unavailable — running in memory-only mode');
  }

  server.listen(PORT, () => {
    console.log(`[AetherOS] Server running on http://localhost:${PORT}`);
    console.log(`[AetherOS] WebSocket on ws://localhost:${PORT}/ws`);
  });
}

// Graceful shutdown
function shutdown() {
  console.log('\n[AetherOS] Shutting down...');
  wss.close(() => {
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log('[AetherOS] Bye.');
        process.exit(0);
      }).catch(() => process.exit(0));
    });
  });
  // Force exit after 5s
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();

module.exports = { app, server, wss };
