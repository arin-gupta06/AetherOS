/**
 * AetherOS — Right Property Panel (Node Inspector + Edge Inspector + Runtime Assignment)
 */
import React from 'react';
import { X, Box, Trash2, ArrowRight, Cloud } from 'lucide-react';
import useStore from '../store/useStore';

const runtimes = ['node', 'bun', 'deno', 'python', 'go', 'rust', 'java', 'ruby', 'php', '.net', 'unknown'];
const envTypes = ['container', 'local', 'serverless'];
const nodeTypes = ['service', 'api', 'frontend', 'database', 'cache', 'queue', 'worker', 'runtime', 'container', 'boundary'];
const cloudProviders = ['Local', 'Azure', 'AWS', 'GCP'];

const azureInstanceTypes = ['Standard B1', 'Standard B2s', 'Standard D2s', 'Standard F2s', 'Premium OP1'];
const awsInstanceTypes = ['t2.micro', 't2.small', 't2.medium', 'm5.large', 'm5.xlarge', 'c5.large'];
const gcpInstanceTypes = ['e2-micro', 'e2-small', 'e2-medium', 'n2-standard-2', 'n2-standard-4'];

const azureRegions = ['eastus', 'westus', 'northeurope', 'westeurope', 'southeastasia', 'eastasia'];
const awsRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'];
const gcpRegions = ['us-central1', 'us-east1', 'europe-west1', 'asia-east1', 'asia-southeast1'];

export default function RightPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectedEdgeId = useStore(s => s.selectedEdgeId);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const rightPanelOpen = useStore(s => s.rightPanelOpen);
  const rightPanelTab = useStore(s => s.rightPanelTab);
  const setRightPanelTab = useStore(s => s.setRightPanelTab);
  const updateNode = useStore(s => s.updateNode);
  const updateEdge = useStore(s => s.updateEdge);
  const removeNode = useStore(s => s.removeNode);
  const removeEdge = useStore(s => s.removeEdge);
  const setSelectedNode = useStore(s => s.setSelectedNode);
  const setSelectedEdge = useStore(s => s.setSelectedEdge);

  if (!rightPanelOpen) return null;

  // --- Edge Inspector ---
  if (selectedEdgeId && !selectedNodeId) {
    const edge = edges.find(e => e.id === selectedEdgeId);
    if (!edge) return null;
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    return (
      <div className="relative pointer-events-none w-80 shrink-0 h-full flex flex-col justify-start">
        <div className="w-80 glass-panel border border-aether-border h-auto max-h-[calc(100%-1rem)] my-2 mr-2 overflow-y-auto animate-slide-in shrink-0 shadow-2xl z-50 pointer-events-auto flex flex-col absolute right-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-xl">
            <div>
              <h3 className="text-xs font-semibold text-aether-text flex items-center gap-1.5">
                <ArrowRight size={13} className="text-aether-accent" /> Edge
              </h3>
              <span className="text-[10px] text-aether-muted font-mono">{selectedEdgeId.slice(0, 8)}…</span>
            </div>
            <button onClick={() => setSelectedEdge(null)} className="text-aether-muted hover:text-aether-text transition">
              <X size={16} />
            </button>
          </div>
          <div className="p-3 space-y-3">
            <Field label="Connection">
              <div className="flex items-center gap-2 text-xs font-mono text-aether-muted bg-aether-bg border border-aether-border rounded px-2.5 py-1.5">
                <span className="text-aether-text truncate">{sourceNode?.data?.label || edge.source.slice(0, 8)}</span>
                <ArrowRight size={12} className="text-aether-accent shrink-0" />
                <span className="text-aether-text truncate">{targetNode?.data?.label || edge.target.slice(0, 8)}</span>
              </div>
            </Field>
            <Field label="Label">
              <input
                value={edge.label || ''}
                onChange={e => updateEdge(selectedEdgeId, { label: e.target.value })}
                placeholder="e.g. depends_on, calls, publishes"
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition"
              />
            </Field>
            <Field label="Style">
              <div className="flex gap-2">
                {[false, true].map(animated => (
                  <button
                    key={String(animated)}
                    onClick={() => updateEdge(selectedEdgeId, { animated })}
                    className={`flex-1 py-1.5 rounded text-[10px] font-medium capitalize transition border ${
                      !!edge.animated === animated
                        ? 'bg-aether-accent/20 border-aether-accent/50 text-aether-accent'
                        : 'bg-aether-bg border-aether-border text-aether-muted'
                    }`}
                  >
                    {animated ? 'Animated' : 'Static'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Edge ID">
              <code className="block text-[10px] font-mono text-aether-muted bg-aether-bg p-2 rounded border border-aether-border break-all">
                {selectedEdgeId}
              </code>
            </Field>
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => { removeEdge(selectedEdgeId); setSelectedEdge(null); }}
                className="w-full py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium hover:bg-red-500/20 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Remove Edge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Node Inspector ---
  if (!selectedNodeId) return null;

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
        {['properties', 'runtime', 'cloud', 'metadata'].map(tab => (
          <button
            key={tab}
            onClick={() => setRightPanelTab(tab)}
            className={`flex-1 py-2 text-[11px] font-medium capitalize border-b-2 transition ${
              rightPanelTab === tab
                ? 'border-aether-accent text-aether-accent'
                : 'border-transparent text-aether-muted hover:text-aether-text'
            }`}
          >
            {tab === 'cloud' ? <Cloud size={12} className="inline mr-1" /> : null}
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

        {rightPanelTab === 'cloud' && (
          <>
            <Field label="Cloud Provider">
              <select
                value={data.cloudProvider || 'Local'}
                onChange={e => {
                  handleUpdate('cloudProvider', e.target.value);
                  // Reset region and instance type on provider change
                  const cloudConfig = data.cloudConfiguration || {};
                  handleUpdate('cloudConfiguration', { ...cloudConfig, region: '', instanceType: '' });
                }}
                className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition appearance-none"
              >
                {cloudProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </Field>

            {data.cloudProvider && data.cloudProvider !== 'Local' && (
              <>
                <Field label="Region">
                  <select
                    value={data.cloudConfiguration?.region || ''}
                    onChange={e => {
                      const cloudConfig = data.cloudConfiguration || {};
                      handleUpdate('cloudConfiguration', { ...cloudConfig, region: e.target.value });
                    }}
                    className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition appearance-none"
                  >
                    <option value="">Select Region</option>
                    {(data.cloudProvider === 'Azure' ? azureRegions :
                      data.cloudProvider === 'AWS' ? awsRegions :
                      data.cloudProvider === 'GCP' ? gcpRegions : []).map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Instance Type">
                  <select
                    value={data.cloudConfiguration?.instanceType || ''}
                    onChange={e => {
                      const cloudConfig = data.cloudConfiguration || {};
                      handleUpdate('cloudConfiguration', { ...cloudConfig, instanceType: e.target.value });
                    }}
                    className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition appearance-none"
                  >
                    <option value="">Select Instance Type</option>
                    {(data.cloudProvider === 'Azure' ? azureInstanceTypes :
                      data.cloudProvider === 'AWS' ? awsInstanceTypes :
                      data.cloudProvider === 'GCP' ? gcpInstanceTypes : []).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Tier/SKU">
                  <input
                    value={data.cloudConfiguration?.tier || ''}
                    onChange={e => {
                      const cloudConfig = data.cloudConfiguration || {};
                      handleUpdate('cloudConfiguration', { ...cloudConfig, tier: e.target.value });
                    }}
                    placeholder={data.cloudProvider === 'Azure' ? 'e.g. Free, Standard, Premium' : 'e.g. Standard, Premium'}
                    className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition"
                  />
                </Field>

                <Field label="Replicas">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={data.cloudConfiguration?.replicas || 1}
                    onChange={e => {
                      const cloudConfig = data.cloudConfiguration || {};
                      handleUpdate('cloudConfiguration', { ...cloudConfig, replicas: Math.max(1, parseInt(e.target.value) || 1) });
                    }}
                    className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition font-mono"
                  />
                </Field>

                <Field label="Auto-Scale">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => {
                        const cloudConfig = data.cloudConfiguration || {};
                        handleUpdate('cloudConfiguration', { ...cloudConfig, autoScale: !cloudConfig.autoScale });
                      }}
                      className={`flex-1 py-1.5 rounded text-[10px] font-medium capitalize transition border ${
                        data.cloudConfiguration?.autoScale
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-aether-bg border-aether-border text-aether-muted'
                      }`}
                    >
                      {data.cloudConfiguration?.autoScale ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </Field>

                {data.cloudConfiguration?.autoScale && (
                  <Field label="Max Replicas">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={data.cloudConfiguration?.maxReplicas || 10}
                      onChange={e => {
                        const cloudConfig = data.cloudConfiguration || {};
                        handleUpdate('cloudConfiguration', { ...cloudConfig, maxReplicas: Math.max(1, parseInt(e.target.value) || 10) });
                      }}
                      className="w-full bg-aether-bg border border-aether-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-aether-accent transition font-mono"
                    />
                  </Field>
                )}
              </>
            )}
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
