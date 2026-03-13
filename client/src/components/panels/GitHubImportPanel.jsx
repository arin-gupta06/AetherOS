import React, { useState } from 'react';
import {
  Github,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { analyzeGitHubRepository } from '../../lib/githubApi';

/**
 * GitHubImportPanel
 * Import architecture from GitHub repositories
 */
export default function GitHubImportPanel({ onArchitectureDetected }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copiedFields, setCopiedFields] = useState({});

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setAnalysisResult(null);

    try {
      const result = await analyzeGitHubRepository(repoUrl);

      if (result.status === 'error') {
        setError(result.message);
        return;
      }

      setAnalysisResult(result);
      setSuccess(true);

      // Auto-import the detected architecture to canvas
      if (onArchitectureDetected && result.architecture) {
        onArchitectureDetected(result.architecture);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopiedFields({ ...copiedFields, [field]: true });
    setTimeout(() => {
      setCopiedFields({ ...copiedFields, [field]: false });
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-700 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="absolute inset-0 opacity-10 blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full"></div>
        </div>
        <div className="relative flex items-center gap-3">
          <Github className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="font-bold text-base">GitHub Import</h2>
            <p className="text-xs text-slate-300">Auto-detect architecture from repos</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">Repository URL</label>
          <input
            type="text"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="
              w-full px-4 py-2 rounded-lg
              bg-slate-700/50 border border-slate-600
              text-white placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
            "
          />
          <p className="text-xs text-slate-400">
            Example: https://github.com/facebook/react
          </p>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !repoUrl.trim()}
          className="
            w-full relative py-2.5 px-4 rounded-lg font-medium
            bg-gradient-to-r from-blue-600 to-blue-500
            hover:from-blue-700 hover:to-blue-600
            disabled:from-slate-600 disabled:to-slate-500 disabled:opacity-50
            disabled:cursor-not-allowed
            text-white transition-all duration-200
            flex items-center justify-center gap-2
            shadow-lg hover:shadow-blue-500/30
          "
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Github className="w-4 h-4" />
              <span>Analyze Repository</span>
            </>
          )}
        </button>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-300">Analysis Failed</p>
                <p className="text-sm text-red-200/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && analysisResult && (
          <div className="space-y-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300">Analysis Complete</p>
                <p className="text-sm text-green-200/80 mt-1">
                  Architecture detected and added to canvas
                </p>
              </div>
            </div>

            {/* Repository Info */}
            {analysisResult.repository && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-200">Repository</h3>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-300">
                      {analysisResult.repository.owner}/{analysisResult.repository.repo}
                    </span>
                    <a
                      href={analysisResult.repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Detected Services */}
            {analysisResult.detectedServices && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-200">Detected Components</h3>
                <div className="text-sm space-y-1">
                  {analysisResult.detectedServices.frontend && (
                    <div className="p-2 bg-slate-700/30 rounded flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <span>{analysisResult.detectedServices.frontend.name}</span>
                      <span className="text-xs text-slate-400">
                        ({analysisResult.detectedServices.frontend.framework})
                      </span>
                    </div>
                  )}

                  {analysisResult.detectedServices.backend && (
                    <div className="p-2 bg-slate-700/30 rounded flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>{analysisResult.detectedServices.backend.name}</span>
                      <span className="text-xs text-slate-400">
                        ({analysisResult.detectedServices.backend.runtime})
                      </span>
                    </div>
                  )}

                  {analysisResult.detectedServices.database && (
                    <div className="p-2 bg-slate-700/30 rounded flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span>{analysisResult.detectedServices.database.name}</span>
                      <span className="text-xs text-slate-400">
                        ({analysisResult.detectedServices.database.databases.join(', ')})
                      </span>
                    </div>
                  )}

                  {analysisResult.detectedServices.messageQueue && (
                    <div className="p-2 bg-slate-700/30 rounded flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span>{analysisResult.detectedServices.messageQueue.name}</span>
                      <span className="text-xs text-slate-400">Message Queue</span>
                    </div>
                  )}

                  {analysisResult.detectedServices.workers &&
                    analysisResult.detectedServices.workers.length > 0 && (
                      <div className="p-2 bg-slate-700/30 rounded flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <span>
                          {analysisResult.detectedServices.workers.length} Background Worker
                          {analysisResult.detectedServices.workers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                  {analysisResult.detectedServices.caches &&
                    analysisResult.detectedServices.caches.length > 0 && (
                      <div className="p-2 bg-slate-700/30 rounded flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                        <span>
                          {analysisResult.detectedServices.caches.map(c => c.name).join(', ')}
                        </span>
                        <span className="text-xs text-slate-400">Caches</span>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Generated Graph Info */}
            {analysisResult.architecture && (
              <div className="text-xs text-slate-400 p-2 bg-slate-700/20 rounded">
                <p>
                  Generated {analysisResult.architecture.nodes?.length || 0} nodes and{' '}
                  {analysisResult.architecture.edges?.length || 0} connections
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!success && !loading && !error && (
          <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-600">
            <p className="text-sm text-slate-300">
              Paste a GitHub repository URL above to automatically detect and import its architecture.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              The analyzer detects: frontend frameworks, backend services, databases, message queues,
              and workers from configuration files like package.json, docker-compose.yml, and
              requirements.txt.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-700 p-3 bg-slate-900/50 text-xs text-slate-400">
        <p>
          ℹ️ GitHub token recommended for higher rate limits. Set{' '}
          <code className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">GITHUB_TOKEN</code>
        </p>
      </div>
    </div>
  );
}
