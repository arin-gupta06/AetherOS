/**
 * AetherOS — Repository Inference Panel
 */
import React, { useState } from 'react';
import { GitBranch, Loader2, Upload, FolderOpen } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

export default function InferencePanel() {
  const [repoUrl, setRepoUrl] = useState('');
  const [localPath, setLocalPath] = useState('');

  const inferenceLoading = useStore(s => s.inferenceLoading);
  const setInferenceLoading = useStore(s => s.setInferenceLoading);
  const importInferredGraph = useStore(s => s.importInferredGraph);
  const setNotification = useStore(s => s.setNotification);

  const handleInferGithub = async () => {
    if (!repoUrl.trim()) return;
    setInferenceLoading(true);
    try {
      const result = await api.inferFromGithub(repoUrl.trim());
      importInferredGraph(result);
      setNotification(`Inferred ${result.nodes?.length || 0} services from repository`);
    } catch (err) {
      setNotification('Inference failed: ' + err.message);
    } finally {
      setInferenceLoading(false);
    }
  };

  const handleInferLocal = async () => {
    if (!localPath.trim()) return;
    setInferenceLoading(true);
    try {
      const result = await api.inferFromLocal(localPath.trim());
      importInferredGraph(result);
      setNotification(`Inferred ${result.nodes?.length || 0} services from local path`);
    } catch (err) {
      setNotification('Inference failed: ' + err.message);
    } finally {
      setInferenceLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-aether-muted mb-3">
        Architecture Inference
      </h3>
      <p className="text-[11px] text-aether-muted mb-4">
        Auto-generate architecture from a repository. Supports GitHub URLs, docker-compose, package.json, and more.
      </p>

      {/* GitHub URL */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-xs text-aether-text mb-1.5">
          <GitBranch size={12} /> GitHub Repository
        </label>
        <input
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs outline-none focus:border-aether-accent transition font-mono"
          onKeyDown={e => e.key === 'Enter' && handleInferGithub()}
        />
        <button
          onClick={handleInferGithub}
          disabled={inferenceLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded bg-aether-accent text-white text-xs font-medium hover:bg-aether-accent-light transition disabled:opacity-50"
        >
          {inferenceLoading ? (
            <><Loader2 size={14} className="animate-spin" /> Inferring...</>
          ) : (
            <><Upload size={14} /> Infer Architecture</>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-aether-border" />
        <span className="text-[10px] text-aether-muted">OR</span>
        <div className="flex-1 h-px bg-aether-border" />
      </div>

      {/* Local path */}
      <div>
        <label className="flex items-center gap-1.5 text-xs text-aether-text mb-1.5">
          <FolderOpen size={12} /> Local Path
        </label>
        <input
          value={localPath}
          onChange={e => setLocalPath(e.target.value)}
          placeholder="C:\Projects\my-app or /home/user/project"
          className="w-full bg-aether-bg border border-aether-border rounded px-3 py-2 text-xs outline-none focus:border-aether-accent transition font-mono"
          onKeyDown={e => e.key === 'Enter' && handleInferLocal()}
        />
        <button
          onClick={handleInferLocal}
          disabled={inferenceLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded bg-aether-bg border border-aether-border text-aether-text text-xs hover:border-aether-accent/50 transition disabled:opacity-50"
        >
          <FolderOpen size={14} /> Infer from Local
        </button>
      </div>

      {/* Supported sources */}
      <div className="mt-6 p-3 bg-aether-bg rounded-lg border border-aether-border">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-aether-muted mb-2">
          Detected Sources
        </h4>
        <div className="grid grid-cols-1 gap-1 text-[11px] text-aether-muted">
          {['docker-compose.yml', 'Dockerfile', 'package.json', 'requirements.txt', 'OpenAPI specs', '.env files'].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-aether-accent" />
              <span className="font-mono">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
