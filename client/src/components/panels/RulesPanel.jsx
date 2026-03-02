/**
 * AetherOS — Rules & Governance Panel
 */
import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, AlertTriangle, XCircle, Info, PlayCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

export default function RulesPanel() {
  const [templates, setTemplates] = useState([]);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const rules = useStore(s => s.rules);
  const violations = useStore(s => s.violations);
  const riskScore = useStore(s => s.riskScore);
  const addRule = useStore(s => s.addRule);
  const removeRule = useStore(s => s.removeRule);
  const toggleRule = useStore(s => s.toggleRule);
  const setViolations = useStore(s => s.setViolations);
  const setNotification = useStore(s => s.setNotification);

  useEffect(() => {
    api.getRuleTemplates().then(setTemplates).catch(() => {});
  }, []);

  const handleValidate = async () => {
    if (nodes.length === 0) {
      setNotification('No nodes to validate');
      return;
    }
    try {
      const nodeData = nodes.map(n => ({
        id: n.id,
        type: n.data?.nodeType || n.type,
        label: n.data?.label,
        data: n.data
      }));
      const result = await api.validateRules(nodeData, edges, rules);
      setViolations(result.violations, result.riskScore);
      setNotification(`Validation complete: ${result.violations.length} violations (risk: ${result.riskScore}%)`);
    } catch (err) {
      setNotification('Validation failed: ' + err.message);
    }
  };

  const handleDetectCircular = async () => {
    try {
      const nodeData = nodes.map(n => ({
        id: n.id, type: n.data?.nodeType || n.type, label: n.data?.label
      }));
      const result = await api.detectCircular(nodeData, edges);
      if (result.hasCycles) {
        setNotification(`Circular dependencies detected: ${result.cycles.length} cycle(s)`);
      } else {
        setNotification('No circular dependencies found');
      }
    } catch (err) {
      setNotification('Detection failed: ' + err.message);
    }
  };

  const severityIcon = (severity) => {
    if (severity === 'error') return <XCircle size={12} className="text-aether-danger" />;
    if (severity === 'warning') return <AlertTriangle size={12} className="text-aether-warning" />;
    return <Info size={12} className="text-blue-400" />;
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-aether-muted mb-3">
        Governance Rules
      </h3>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleValidate}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-aether-accent text-white text-xs font-medium hover:bg-aether-accent-light transition"
        >
          <PlayCircle size={14} /> Validate
        </button>
        <button
          onClick={handleDetectCircular}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-aether-bg border border-aether-border text-aether-text text-xs hover:border-aether-accent/50 transition"
        >
          Circular Deps
        </button>
      </div>

      {/* Risk Score */}
      <div className="mb-4 p-3 rounded-lg bg-aether-bg border border-aether-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-aether-muted">Risk Score</span>
          <span className={`text-lg font-bold font-mono ${
            riskScore > 50 ? 'text-aether-danger' : riskScore > 20 ? 'text-aether-warning' : 'text-aether-success'
          }`}>{riskScore}%</span>
        </div>
        <div className="w-full h-1.5 bg-aether-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${riskScore}%`,
              backgroundColor: riskScore > 50 ? '#ef4444' : riskScore > 20 ? '#f59e0b' : '#10b981'
            }}
          />
        </div>
      </div>

      {/* Active Rules */}
      <div className="mb-4">
        <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Active Rules ({rules.length})</h4>
        {rules.length === 0 ? (
          <p className="text-[11px] text-aether-muted italic">No rules defined. Add from templates below.</p>
        ) : (
          <div className="space-y-1.5">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center gap-2 p-2 rounded bg-aether-bg border border-aether-border">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`w-3 h-3 rounded-full border ${rule.enabled ? 'bg-aether-success border-aether-success' : 'border-aether-muted'}`}
                />
                <span className={`flex-1 text-[11px] ${rule.enabled ? 'text-aether-text' : 'text-aether-muted line-through'}`}>
                  {rule.name}
                </span>
                {severityIcon(rule.severity)}
                <button onClick={() => removeRule(rule.id)} className="text-aether-muted hover:text-aether-danger transition">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[10px] uppercase tracking-wider text-aether-danger mb-2">
            Violations ({violations.length})
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {violations.map(v => (
              <div key={v.id} className="p-2 rounded bg-aether-danger/10 border border-aether-danger/30 text-[11px]">
                <div className="flex items-start gap-1.5">
                  {severityIcon(v.severity)}
                  <span className="text-aether-text">{v.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule Templates */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Templates</h4>
        <div className="space-y-1.5">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => addRule(tpl)}
              className="w-full text-left p-2 rounded bg-aether-bg border border-aether-border hover:border-aether-accent/40 transition"
            >
              <div className="flex items-center gap-2">
                <Plus size={12} className="text-aether-accent" />
                <span className="text-[11px] text-aether-text">{tpl.name}</span>
              </div>
              {tpl.description && (
                <p className="text-[10px] text-aether-muted mt-0.5 ml-5">{tpl.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
