/**
 * AetherOS — Main Application
 * Unified Architectural Intelligence and System Modeling Platform
 */
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ModelingCanvas from './components/ModelingCanvas';
import RightPanel from './components/RightPanel';
import Notification from './components/Notification';
import useWebSocket from './hooks/useWebSocket';
import useStore from './store/useStore';
import api from './lib/api';
import { Hexagon, Plus, FolderGit2, ArrowRight } from 'lucide-react';

/** Prefix for quick-start (in-memory only) environments */
const LOCAL_ENV_PREFIX = '__local__';

function WelcomeScreen() {
  const [envName, setEnvName] = useState('');
  const [creating, setCreating] = useState(false);
  const setCurrentEnvironment = useStore(s => s.setCurrentEnvironment);
  const loadEnvironments = useStore(s => s.loadEnvironments);
  const setNotification = useStore(s => s.setNotification);

  const handleCreate = async () => {
    if (!envName.trim()) return;
    setCreating(true);
    try {
      const env = await api.createEnvironment({ name: envName.trim() });
      setCurrentEnvironment(env);
      const envs = await api.getEnvironments();
      loadEnvironments(envs);
    } catch (err) {
      setNotification('Failed to create: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleQuickStart = () => {
    // Create an in-memory environment without backend
    setCurrentEnvironment({
      _id: LOCAL_ENV_PREFIX + Date.now(),
      name: 'My Workspace',
      nodes: [],
      edges: [],
      rules: [],
      events: []
    });
  };

  return (
    <div className="h-screen w-screen bg-aether-bg flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hexagon size={40} className="text-aether-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-aether-text tracking-tight">AetherOS</h1>
          <p className="text-sm text-aether-muted mt-2">
            Unified Architectural Intelligence Platform
          </p>
          <p className="text-xs text-aether-muted mt-1 max-w-sm mx-auto">
            Model, infer, simulate, and inspect complex software systems within a governed, state-aware environment.
          </p>
        </div>

        <div className="bg-aether-surface border border-aether-border rounded-xl p-6 space-y-4">
          {/* Create new */}
          <div>
            <label className="text-[11px] text-aether-muted uppercase tracking-wider mb-1.5 block">
              Create New Environment
            </label>
            <div className="flex gap-2">
              <input
                value={envName}
                onChange={e => setEnvName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="My Architecture"
                className="flex-1 bg-aether-bg border border-aether-border rounded-lg px-3 py-2 text-sm outline-none focus:border-aether-accent transition"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-aether-accent text-white text-sm font-medium hover:bg-aether-accent-light transition disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={16} /> Create
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-aether-border" />
            <span className="text-[10px] text-aether-muted">OR</span>
            <div className="flex-1 h-px bg-aether-border" />
          </div>

          {/* Quick start (no backend needed) */}
          <button
            onClick={handleQuickStart}
            className="w-full p-3 rounded-lg bg-aether-bg border border-aether-border hover:border-aether-accent/40 transition text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderGit2 size={18} className="text-aether-accent" />
                <div>
                  <div className="text-sm font-medium text-aether-text">Quick Start</div>
                  <div className="text-[11px] text-aether-muted">Start modeling in-memory (no database required)</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-aether-muted group-hover:text-aether-accent transition" />
            </div>
          </button>
        </div>

        <p className="text-center text-[10px] text-aether-muted mt-6">
          AetherOS v1.0 — Governed Architectural Reasoning Laboratory
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const currentEnvironment = useStore(s => s.currentEnvironment);
  const loadEnvironments = useStore(s => s.loadEnvironments);
  const setNotification = useStore(s => s.setNotification);

  useWebSocket();

  // Load environments on mount
  useEffect(() => {
    api.getEnvironments()
      .then(envs => loadEnvironments(envs))
      .catch(() => {
        // Backend not available — that's okay, welcome screen handles it
      });
  }, [loadEnvironments]);

  if (!currentEnvironment) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-aether-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <ModelingCanvas />
        </main>
        <RightPanel />
      </div>
      <Notification />
    </div>
  );
}
