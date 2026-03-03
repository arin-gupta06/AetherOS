/**
 * AetherOS — Right Property Panel (Node Inspector + Runtime Assignment)
 */
import React from 'react';
import { X, Box, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

const runtimes = ['node', 'bun', 'deno', 'python', 'go', 'rust', 'java', 'ruby', 'php', '.net', 'unknown'];
const envTypes = ['container', 'local', 'serverless'];
const nodeTypes = ['service', 'api', 'frontend', 'database', 'cache', 'queue', 'worker', 'runtime', 'container', 'boundary'];

export default function RightPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const nodes = useStore(s => s.nodes);
  const rightPanelOpen = useStore(s => s.rightPanelOpen);
  const rightPanelTab = useStore(s => s.rightPanelTab);
  const setRightPanelTab = useStore(s => s.setRightPanelTab);
  const updateNode = useStore(s => s.updateNode);
  const removeNode = useStore(s => s.removeNode);
  const setSelectedNode = useStore(s => s.setSelectedNode);

  if (!rightPanelOpen || !selectedNodeId) return null;

  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const data = node.data || {};

  const handleUpdate = (field, value) => {
    updateNode(selectedNodeId, { [field]: value });
  };

  return (
    <div className="relative pointer-events-none w-80 shrink-0 h-full flex flex-col justify-start">
      <div className="w-80 glass-panel border border-aether-border h-auto max-h-[calc(100%-1rem)] my-2 mr-2 overflow-y-auto animate-slide-in shrink-0 shadow-2xl z-50 pointer-events-auto flex flex-col absolute right-0">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-xl">
        <div>
          <h3 className="text-xs font-semibold text-aether-text">{data.label || 'Unknown'}</h3>
          <span className="text-[10px] text-aether-muted font-mono">{selectedNodeId.slice(0, 8)}…</span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-aether-muted hover:text-aether-text transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-aether-border">
        {['properties', 'runtime', 'metadata'].map(tab => (
          <button
            key={tab}
            onClick={() => setRightPanelTab(tab)}
            className={`flex-1 py-2 text-[11px] font-medium capitalize border-b-2 transition ${
              rightPanelTab === tab
                ? 'border-aether-accent text-aether-accent'
                : 'border-transparent text-aether-muted hover:text-aether-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {rightPanelTab === 'properties' && (
          <>
            <Field label="Label">
              <input
                value={data.label || ''}
                onChange={e => handleUpdate('label', e.target.value)}
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition"
              />
            </Field>

            <Field label="Node Type">
              <select
                value={data.nodeType || 'service'}
                onChange={e => handleUpdate('nodeType', e.target.value)}
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition appearance-none"
              >
                {nodeTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Port">
              <input
                type="number"
                value={data.port || ''}
                onChange={e => handleUpdate('port', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g. 3000"
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition font-mono"
              />
            </Field>

            <Field label="Boundary">
              <input
                value={data.boundary || ''}
                onChange={e => handleUpdate('boundary', e.target.value)}
                placeholder="e.g. internal, dmz, external"
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition"
              />
            </Field>

            {/* Status */}
            <Field label="Status">
              <div className="flex gap-2">
                {['healthy', 'degraded', 'failed'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleUpdate('status', s)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium capitalize transition border ${
                      data.status === s
                        ? s === 'healthy' ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : s === 'degraded' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                          : 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-aether-bg border-aether-border text-aether-muted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {rightPanelTab === 'runtime' && (
          <>
            <Field label="Execution Runtime">
              <select
                value={data.runtime || ''}
                onChange={e => handleUpdate('runtime', e.target.value)}
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition appearance-none"
              >
                <option value="">Not assigned</option>
                {runtimes.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="Environment Type">
              <div className="flex gap-2">
                {envTypes.map(env => (
                  <button
                    key={env}
                    onClick={() => handleUpdate('environmentType', env)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-medium capitalize transition border ${
                      data.environmentType === env
                        ? 'bg-aether-accent/20 border-aether-accent/50 text-aether-accent'
                        : 'bg-aether-bg border-aether-border text-aether-muted'
                    }`}
                  >
                    {env === 'container' ? <Box size={10} className="inline mr-1" /> : null}
                    {env}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="CPU Constraint">
              <input
                value={data.cpu || ''}
                onChange={e => handleUpdate('cpu', e.target.value)}
                placeholder="e.g. 0.5, 1, 2"
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition font-mono"
              />
            </Field>

            <Field label="Memory Constraint">
              <input
                value={data.memory || ''}
                onChange={e => handleUpdate('memory', e.target.value)}
                placeholder="e.g. 256Mi, 1Gi"
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition font-mono"
              />
            </Field>

            <Field label="Permission Scope">
              <input
                value={(data.permissions || []).join(', ')}
                onChange={e => handleUpdate('permissions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="read, write, admin"
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition"
              />
            </Field>
          </>
        )}

        {rightPanelTab === 'metadata' && (
          <>
            <Field label="Node ID">
              <code className="block text-[10px] font-mono text-aether-muted bg-aether-bg p-2 rounded border border-aether-border break-all">
                {selectedNodeId}
              </code>
            </Field>

            <Field label="Position">
              <code className="block text-[10px] font-mono text-aether-muted bg-aether-bg p-2 rounded border border-aether-border">
                x: {Math.round(node.position?.x || 0)}, y: {Math.round(node.position?.y || 0)}
              </code>
            </Field>

            {data.metadata && Object.keys(data.metadata).length > 0 && (
              <Field label="Inference Metadata">
                <pre className="text-[10px] font-mono text-aether-muted bg-aether-bg p-2 rounded border border-aether-border overflow-x-auto max-h-40 whitespace-pre-wrap">
                  {JSON.stringify(data.metadata, null, 2)}
                </pre>
              </Field>
            )}
          </>
        )}

        {/* Delete button */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={() => { removeNode(selectedNodeId); setSelectedNode(null); }}
            className="w-full py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium hover:bg-red-500/20 transition flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)]"
          >
            <Trash2 size={14} /> Remove Node
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-aether-muted uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}
