/**
 * AetherOS — Failure Injection & Simulation Panel
 */
import React, { useState, useEffect } from 'react';
import { Zap, XCircle, AlertTriangle, Activity, RotateCcw } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

export default function SimulationPanel() {
  const [failureTypes, setFailureTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('service-down');
  const [selectedTarget, setSelectedTarget] = useState('');

  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const simulationActive = useStore(s => s.simulationActive);
  const simulationResult = useStore(s => s.simulationResult);
  const resilienceScore = useStore(s => s.resilienceScore);
  const setSimulationResult = useStore(s => s.setSimulationResult);
  const clearSimulation = useStore(s => s.clearSimulation);
  const setResilienceScore = useStore(s => s.setResilienceScore);
  const setNotification = useStore(s => s.setNotification);

  useEffect(() => {
    api.getFailureTypes().then(setFailureTypes).catch(() => {});
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      const nodeData = nodes.map(n => ({ id: n.id, type: n.data?.nodeType || n.type, label: n.data?.label, data: n.data }));
      api.getResilienceScore(nodeData, edges)
        .then(r => setResilienceScore(r.resilienceScore))
        .catch(() => {});
    }
  }, [nodes.length, edges.length]);

  const handleInject = async () => {
    if (!selectedTarget) {
      setNotification('Select a target node');
      return;
    }
    try {
      const nodeData = nodes.map(n => ({
        id: n.id, type: n.data?.nodeType || n.type, label: n.data?.label, data: n.data
      }));
      const result = await api.injectFailure(nodeData, edges, selectedTarget, selectedType, {});
      setSimulationResult(result);
      setNotification(`Failure injected: ${result.affectedNodes.length} nodes affected`);
    } catch (err) {
      setNotification('Injection failed: ' + err.message);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-aether-muted mb-3">
        Failure Simulation
      </h3>
      <p className="text-[11px] text-aether-muted mb-4">
        Inject failures to analyze cascading impact and system resilience.
      </p>

      {/* Resilience Score */}
      <div className="mb-4 p-3 rounded-lg bg-aether-bg border border-aether-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-aether-muted">Resilience Score</span>
          <span className={`text-lg font-bold font-mono ${
            resilienceScore < 50 ? 'text-aether-danger' : resilienceScore < 75 ? 'text-aether-warning' : 'text-aether-success'
          }`}>{resilienceScore}%</span>
        </div>
        <div className="w-full h-1.5 bg-aether-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${resilienceScore}%`,
              backgroundColor: resilienceScore < 50 ? '#ef4444' : resilienceScore < 75 ? '#f59e0b' : '#10b981'
            }}
          />
        </div>
      </div>

      {!simulationActive ? (
        <>
          {/* Failure Type */}
          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wider text-aether-muted mb-1.5 block">
              Failure Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs outline-none focus:border-aether-accent transition"
            >
              {failureTypes.map(ft => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
              {failureTypes.length === 0 && (
                <>
                  <option value="service-down">Service Down</option>
                  <option value="latency">Latency</option>
                  <option value="resource-exhaustion">Resource Exhaustion</option>
                  <option value="dependency-unavailable">Dependency Unavailable</option>
                  <option value="permission-conflict">Permission Conflict</option>
                </>
              )}
            </select>
          </div>

          {/* Target Node */}
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wider text-aether-muted mb-1.5 block">
              Target Node
            </label>
            <select
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs outline-none focus:border-aether-accent transition"
            >
              <option value="">Select a node...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.data?.label || n.id}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleInject}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded bg-aether-danger text-white text-xs font-medium hover:bg-red-500 transition"
          >
            <Zap size={14} /> Inject Failure
          </button>
        </>
      ) : (
        <>
          {/* Simulation Results */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-aether-warning animate-pulse" />
              <span className="text-xs font-semibold text-aether-warning">Simulation Active</span>
            </div>

            {simulationResult && (
              <div className="space-y-2">
                <div className="p-2 rounded bg-aether-danger/10 border border-aether-danger/30">
                  <span className="text-[10px] uppercase tracking-wider text-aether-danger">Affected Nodes</span>
                  <span className="text-lg font-bold font-mono text-aether-danger ml-2">
                    {simulationResult.affectedNodes.length}
                  </span>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {simulationResult.affectedNodes.map((an, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-aether-bg border border-aether-border text-[11px]">
                      {an.impact === 'direct'
                        ? <XCircle size={12} className="text-aether-danger shrink-0" />
                        : <AlertTriangle size={12} className="text-aether-warning shrink-0" />
                      }
                      <span className="flex-1 truncate">{an.label}</span>
                      <span className={`text-[10px] font-mono ${
                        an.status === 'failed' ? 'text-aether-danger' : 'text-aether-warning'
                      }`}>{an.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={clearSimulation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded bg-aether-bg border border-aether-border text-aether-text text-xs hover:border-aether-success/50 transition"
          >
            <RotateCcw size={14} /> Clear Simulation
          </button>
        </>
      )}
    </div>
  );
}
