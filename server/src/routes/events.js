/**
 * AetherOS — Event Log API Routes
 * Centralized architectural event stream.
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { broadcastEvent } = require('../ws/broadcast');

// In-memory event log (also persisted in environment when using MongoDB)
let globalEventLog = [];

// Get all events (optionally filtered)
router.get('/', (req, res) => {
  const { type, severity, limit = 100 } = req.query;
  let events = [...globalEventLog];

  if (type) events = events.filter(e => e.type === type);
  if (severity) events = events.filter(e => e.severity === severity);

  events = events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  events = events.slice(0, parseInt(limit));

  return res.json(events);
});

// Add event
router.post('/', (req, res) => {
  const { type, payload, severity } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'type is required' });
  }
  const event = {
    id: req.body.id || uuidv4(),
    type,
    payload: payload || {},
    severity: severity || 'info',
    timestamp: req.body.timestamp || new Date().toISOString()
  };
  globalEventLog.push(event);

  // Keep max 1000 events in memory
  if (globalEventLog.length > 1000) {
    globalEventLog = globalEventLog.slice(-1000);
  }

  // Broadcast to WS clients
  const clients = req.app.get('wsClients');
  broadcastEvent(clients, { type: 'event-logged', payload: event });

  return res.status(201).json(event);
});

// Clear events
router.delete('/', (_req, res) => {
  globalEventLog = [];
  return res.json({ success: true });
});

module.exports = router;
