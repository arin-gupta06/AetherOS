/**
 * AetherOS — CBCT Structural Intelligence Panel
 */
import React, { useState } from 'react';
import { Search, FolderTree, AlertTriangle, FileCode, Loader2, Flame, GitMerge } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

export default function CbctPanel() {
  const [repoPath, setRepoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('tree');

  const cbctData = useStore(s => s.cbctData);
  const setCbctData = useStore(s => s.setCbctData);
  const setNotification = useStore(s => s.setNotification);

  const handleAnalyze = async () => {
    if (!repoPath.trim()) return setNotification('Enter a repository path');
    setLoading(true);
    try {
      const result = await api.analyzeCbct(repoPath.trim());
      if (result.error) {
        setNotification('CBCT: ' + result.error);
      } else {
        setCbctData(result);
        setNotification(`CBCT: ${result.codeFileCount} code files, ${result.totalLines} lines analyzed`);
      }
    } catch (err) {
      setNotification('CBCT failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAnalyze = async () => {
    setLoading(true);
    try {
      const result = await api.selfAnalyze();
      setCbctData(result);
      setNotification('CBCT self-analysis complete');
    } catch (err) {
      setNotification('CBCT failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTree = (node, depth = 0) => {
    if (!node) return null;
    const isDir = node.type === 'directory';
    return (
      <div key={node.name} style={{ paddingLeft: depth * 12 }}>
        <div className={`flex items-center gap-1 py-0.5 text-[11px] ${isDir ? 'text-aether-accent' : 'text-aether-muted'}`}>
          {isDir ? <FolderTree size={10} /> : <FileCode size={10} />}
          <span>{node.name}</span>
        </div>
        {isDir && node.children?.map(child => renderTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-aether-muted uppercase tracking-wider mb-3">
        Structural Intelligence (CBCT)
      </h3>
      <p className="text-[11px] text-aether-muted mb-3">
        Analyze code structure, dependencies, circular imports, and risk hotspots.
      </p>

      <input
        value={repoPath}
        onChange={e => setRepoPath(e.target.value)}
        placeholder="Path to repository…"
        className="w-full bg-aether-bg border border-aether-border rounded-lg px-3 py-2 text-xs outline-none focus:border-aether-accent transition mb-2 font-mono"
      />

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex-1 py-1.5 rounded-lg bg-aether-accent/20 text-aether-accent text-xs font-medium hover:bg-aether-accent/30 transition flex items-center justify-center gap-1.5"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
          Analyze
        </button>
        <button
          onClick={handleSelfAnalyze}
          disabled={loading}
          className="py-1.5 px-3 rounded-lg bg-aether-bg border border-aether-border text-aether-muted text-xs hover:border-aether-accent/40 transition"
          title="Analyze CBCT's own codebase"
        >
          Self
        </button>
      </div>

      {cbctData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2 rounded-lg bg-aether-bg border border-aether-border text-center">
              <div className="text-sm font-mono font-bold text-aether-accent">{cbctData.codeFileCount}</div>
              <div className="text-[9px] text-aether-muted">Files</div>
            </div>
            <div className="p-2 rounded-lg bg-aether-bg border border-aether-border text-center">
              <div className="text-sm font-mono font-bold text-aether-accent">{cbctData.totalLines?.toLocaleString()}</div>
              <div className="text-[9px] text-aether-muted">Lines</div>
            </div>
            <div className="p-2 rounded-lg bg-aether-bg border border-aether-border text-center">
              <div className={`text-sm font-mono font-bold ${cbctData.circularDependencies?.length > 0 ? 'text-aether-danger' : 'text-aether-success'}`}>
                {cbctData.circularDependencies?.length || 0}
              </div>
              <div className="text-[9px] text-aether-muted">Cycles</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-aether-border mb-3">
            {['tree', 'risks', 'cycles', 'deps'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-[11px] font-medium capitalize transition border-b-2 ${
                  tab === t ? 'border-aether-accent text-aether-accent' : 'border-transparent text-aether-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="max-h-64 overflow-y-auto">
            {tab === 'tree' && cbctData.tree && renderTree(cbctData.tree)}

            {tab === 'risks' && (
              <div className="space-y-1">
                {(cbctData.riskHeatmap || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <div className="flex-1 truncate font-mono text-aether-muted">{item.path}</div>
                    <div className="flex items-center gap-1">
                      <Flame size={10} style={{ color: item.risk > 60 ? '#ef4444' : item.risk > 30 ? '#f59e0b' : '#10b981' }} />
                      <span className={`font-mono ${item.risk > 60 ? 'text-aether-danger' : item.risk > 30 ? 'text-aether-warning' : 'text-aether-success'}`}>
                        {item.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'cycles' && (
              <div className="space-y-2">
                {cbctData.circularDependencies?.length === 0 ? (
                  <p className="text-[11px] text-aether-success italic">No circular dependencies detected ✓</p>
                ) : (
                  cbctData.circularDependencies?.map((cycle, i) => (
                    <div key={i} className="p-2 rounded bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-300">
                      <AlertTriangle size={10} className="inline mr-1" />
                      {cycle.join(' → ')}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'deps' && (
              <div className="space-y-1">
                {!cbctData.dependencies || cbctData.dependencies.length === 0 ? (
                  <p className="text-[11px] text-aether-muted italic">No dependencies detected.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] text-aether-muted">
                      <GitMerge size={11} />
                      <span>{cbctData.dependencies.filter(d => d.type === 'local').length} local · {cbctData.dependencies.filter(d => d.type === 'external').length} external</span>
                    </div>
                    {cbctData.dependencies.slice(0, 100).map((dep, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] font-mono">
                        <span
                          className={`shrink-0 mt-0.5 px-1 rounded text-[9px] font-bold uppercase ${
                            dep.type === 'local'
                              ? 'bg-aether-accent/20 text-aether-accent'
                              : 'bg-aether-surface text-aether-muted'
                          }`}
                        >
                          {dep.type === 'local' ? 'loc' : 'ext'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-aether-muted truncate">{dep.source}</div>
                          <div className="text-aether-text truncate">→ {dep.target}</div>
                        </div>
                      </div>
                    ))}
                    {cbctData.dependencies.length > 100 && (
                      <p className="text-[10px] text-aether-muted mt-1">… and {cbctData.dependencies.length - 100} more</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
