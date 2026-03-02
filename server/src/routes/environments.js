/**
 * AetherOS — Environment API Routes
 * CRUD operations for architectural environments.
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { broadcastEvent } = require('../ws/broadcast');

// In-memory fallback when MongoDB is unavailable
let memoryStore = [];

function getModel() {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      return require('../models/Environment');
    }
  } catch { /* fallback */ }
  return null;
}

// List all environments
router.get('/', async (req, res) => {
  try {
    const Model = getModel();
    if (Model) {
      const envs = await Model.find().select('-events').sort({ updatedAt: -1 });
      return res.json(envs);
    }
    return res.json(memoryStore.map(e => ({ ...e, events: undefined })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single environment
router.get('/:id', async (req, res) => {
  try {
    const Model = getModel();
    if (Model) {
      const env = await Model.findById(req.params.id);
      if (!env) return res.status(404).json({ error: 'Environment not found' });
      return res.json(env);
    }
    const env = memoryStore.find(e => e._id === req.params.id);
    if (!env) return res.status(404).json({ error: 'Environment not found' });
    return res.json(env);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create environment
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const Model = getModel();
    if (Model) {
      const env = await Model.create({ name, description: description || '', nodes: [], edges: [], rules: [], events: [] });
      return res.status(201).json(env);
    }
    const env = {
      _id: uuidv4(),
      name,
      description: description || '',
      nodes: [],
      edges: [],
      rules: [],
      events: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.push(env);
    return res.status(201).json(env);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update environment (full graph save)
router.put('/:id', async (req, res) => {
  try {
    const { nodes, edges, rules, metadata } = req.body;
    const Model = getModel();
    if (Model) {
      const env = await Model.findByIdAndUpdate(
        req.params.id,
        { nodes, edges, rules, metadata, updatedAt: new Date() },
        { new: true }
      );
      if (!env) return res.status(404).json({ error: 'Environment not found' });

      const clients = req.app.get('wsClients');
      broadcastEvent(clients, { type: 'environment-updated', payload: { id: req.params.id } });

      return res.json(env);
    }
    const idx = memoryStore.findIndex(e => e._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Environment not found' });
    // Only override defined fields
    if (nodes !== undefined) memoryStore[idx].nodes = nodes;
    if (edges !== undefined) memoryStore[idx].edges = edges;
    if (rules !== undefined) memoryStore[idx].rules = rules;
    if (metadata !== undefined) memoryStore[idx].metadata = metadata;
    memoryStore[idx].updatedAt = new Date();

    const clients = req.app.get('wsClients');
    broadcastEvent(clients, { type: 'environment-updated', payload: { id: req.params.id } });

    return res.json(memoryStore[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete environment
router.delete('/:id', async (req, res) => {
  try {
    const Model = getModel();
    if (Model) {
      await Model.findByIdAndDelete(req.params.id);
      return res.json({ success: true });
    }
    memoryStore = memoryStore.filter(e => e._id !== req.params.id);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
