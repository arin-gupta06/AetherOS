const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'service', 'api', 'database', 'cache', 'queue',
      'worker', 'runtime', 'container', 'boundary', 'frontend'
    ],
    default: 'service'
  },
  label: { type: String, required: true },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  data: {
    runtime: { type: String, default: '' },
    environmentType: { type: String, enum: ['container', 'local', 'serverless', ''], default: '' },
    cpu: { type: String, default: '' },
    memory: { type: String, default: '' },
    port: { type: Number },
    permissions: [String],
    boundary: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['healthy', 'degraded', 'failed', 'unknown'], default: 'healthy' }
  }
});

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  label: { type: String, default: '' },
  type: { type: String, default: 'default' },
  animated: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const ruleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'boundary-restriction', 'forbidden-path', 'isolation',
      'max-depth', 'access-control', 'custom'
    ]
  },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  enabled: { type: Boolean, default: true },
  severity: { type: String, enum: ['error', 'warning', 'info'], default: 'warning' }
});

const eventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: [
      'node-added', 'node-removed', 'node-updated',
      'edge-added', 'edge-removed',
      'rule-violation', 'rule-added', 'rule-removed',
      'simulation-started', 'simulation-ended',
      'failure-injected', 'failure-propagated',
      'runtime-assigned', 'environment-imported',
      'architecture-inferred'
    ]
  },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  severity: { type: String, enum: ['info', 'warning', 'error'], default: 'info' }
});

const environmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  rules: [ruleSchema],
  events: [eventSchema],
  metadata: {
    repoUrl: String,
    inferredFrom: String,
    version: { type: Number, default: 1 }
  }
});

environmentSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Environment', environmentSchema);
