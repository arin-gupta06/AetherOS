/**
 * AetherOS — Header Bar
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Hexagon, FolderGit2, Save, RotateCcw, Activity,
  ChevronDown, Plus
} from 'lucide-react';
import useStore from '../store/useStore';
import api from '../lib/api';

export default function Header() {
  const [envDropdown, setEnvDropdown] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [showNewEnv, setShowNewEnv] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setEnvDropdown(false);
        setShowNewEnv(false);
      }
    }
    if (envDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [envDropdown]);

  const currentEnvironment = useStore(s => s.currentEnvironment);
  const environments = useStore(s => s.environments);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const rules = useStore(s => s.rules);
  const riskScore = useStore(s => s.riskScore);
  const resilienceScore = useStore(s => s.resilienceScore);
  const simulationActive = useStore(s => s.simulationActive);
  const setNotification = useStore(s => s.setNotification);
  const setCurrentEnvironment = useStore(s => s.setCurrentEnvironment);
  const loadEnvironments = useStore(s => s.loadEnvironments);
  const resetGraph = useStore(s => s.resetGraph);

  const handleSave = async () => {
    if (!currentEnvironment?._id || currentEnvironment._id.startsWith('__local__')) {
      // Local environment — save to backend by creating it first
      try {
        const env = await api.createEnvironment({ name: currentEnvironment.name || 'Untitled' });
        await api.updateEnvironment(env._id, {
          nodes: nodes.map(n => ({
            id: n.id, type: n.type || n.data?.nodeType, label: n.data?.label,
            position: n.position, data: n.data
          })),
          edges,
          rules
        });
        setCurrentEnvironment({ ...currentEnvironment, _id: env._id });
        const envs = await api.getEnvironments();
        loadEnvironments(envs);
        setNotification('Environment created & saved');
      } catch (err) {
        setNotification('Save failed: ' + err.message);
      }
      return;
    }
    try {
      await api.updateEnvironment(currentEnvironment._id, {
        nodes: nodes.map(n => ({
          id: n.id, type: n.type || n.data?.nodeType, label: n.data?.label,
          position: n.position, data: n.data
        })),
        edges,
        rules
      });
      setNotification('Environment saved');
    } catch (err) {
      setNotification('Save failed: ' + err.message);
    }
  };

  const handleCreateEnv = async () => {
    if (!newEnvName.trim()) return;
    try {
      const env = await api.createEnvironment({ name: newEnvName.trim() });
      setCurrentEnvironment(env);
      const envs = await api.getEnvironments();
      loadEnvironments(envs);
      setNewEnvName('');
      setShowNewEnv(false);
      setNotification(`Environment "${env.name}" created`);
    } catch (err) {
      setNotification('Create failed: ' + err.message);
    }
  };

  const handleSelectEnv = async (env) => {
    try {
      const full = await api.getEnvironment(env._id);
      setCurrentEnvironment(full);
      setEnvDropdown(false);
    } catch (err) {
      setNotification('Load failed: ' + err.message);
    }
  };

  return (
    <header className="h-14 glass-panel border-b-0 border-aether-border flex items-center justify-between px-6 shrink-0 z-50 rounded-none rounded-b-xl mx-2 mt-2">
      {/* Left — Logo & Environment */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 icon-container p-1.5">
          <Hexagon size={22} className="text-aether-accent" />
        </div>
        <span className="font-semibold text-sm tracking-wide">AetherOS</span>

        <div className="h-5 w-px bg-aether-border ml-2" />

        {/* Environment selector */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setEnvDropdown(!envDropdown)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-btn-secondary text-xs"
          >
            <FolderGit2 size={14} className="text-aether-muted" />
            <span className="max-w-50 truncate">
              {currentEnvironment?.name || 'No Environment'}
            </span>
            <ChevronDown size={12} className="text-aether-muted" />
          </button>

          {envDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-aether-surface border border-aether-border rounded-lg shadow-xl z-50 py-1 animate-fade-in">
              {environments.map(env => (
                <button
                  key={env._id}
                  onClick={() => handleSelectEnv(env)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-aether-accent/10 transition flex items-center justify-between"
                >
                  <span>{env.name}</span>
                  {env._id === currentEnvironment?._id && (
                    <span className="text-aether-accent">●</span>
                  )}
                </button>
              ))}
              <div className="border-t border-aether-border my-1" />
              {showNewEnv ? (
                <div className="px-3 py-2 flex gap-2">
                  <input
                    value={newEnvName}
                    onChange={e => setNewEnvName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateEnv()}
                    placeholder="Environment name"
                    className="flex-1 bg-aether-bg border border-aether-border rounded px-2 py-1 text-xs outline-none focus:border-aether-accent"
                    autoFocus
                  />
                  <button onClick={handleCreateEnv} className="text-aether-accent text-xs hover:underline">
                    Create
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewEnv(true)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-aether-accent/10 transition flex items-center gap-2 text-aether-accent"
                >
                  <Plus size={12} /> New Environment
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center — Status indicators */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-aether-muted">Nodes:</span>
          <span className="font-mono">{nodes.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-aether-muted">Edges:</span>
          <span className="font-mono">{edges.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-aether-muted">Risk:</span>
          <span className={`font-mono ${riskScore > 50 ? 'text-aether-danger' : riskScore > 20 ? 'text-aether-warning' : 'text-aether-success'}`}>
            {riskScore}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-aether-muted">Resilience:</span>
          <span className={`font-mono ${resilienceScore < 50 ? 'text-aether-danger' : resilienceScore < 75 ? 'text-aether-warning' : 'text-aether-success'}`}>
            {resilienceScore}%
          </span>
        </div>
        {simulationActive && (
          <span className="flex items-center gap-1 text-aether-warning animate-pulse">
            <Activity size={12} /> SIM ACTIVE
          </span>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-aether-accent/20 text-aether-accent-light text-xs hover:bg-aether-accent/30 transition"
        >
          <Save size={12} /> Save
        </button>
        <button
          onClick={resetGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-aether-bg border border-aether-border text-aether-muted text-xs hover:border-aether-danger/50 hover:text-aether-danger transition"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
    </header>
  );
}
