/**
 * GitHub Repository Analyzer Panel
 * UI component for analyzing GitHub repositories
 */

import React, { useState } from 'react';
import { Github, Code2, AlertCircle, Loader } from 'lucide-react';
import { analyzeGitHubRepository } from '../../lib/azureApi';

export default function GitHubAnalyzerPanel() {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyzeRepository = async () => {
    if (!repositoryUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeGitHubRepository(repositoryUrl);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRepositoryUrl(text);
    } catch (err) {
      setError('Could not access clipboard');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Github className="w-5 h-5 text-slate-900 dark:text-white" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            GitHub Repository Analyzer
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Infer architecture from GitHub repositories
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Repository URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeRepository()}
              />
              <button
                onClick={handlePaste}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
              >
                Paste
              </button>
            </div>
          </div>

          <button
            onClick={handleAnalyzeRepository}
            disabled={loading || !repositoryUrl.trim()}
            className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Code2 className="w-4 h-4" />
                Analyze Repository
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis?.status === 'success' && analysis.repository && (
          <div className="space-y-3">
            {/* Repository Info */}
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {analysis.repository.name}
              </h3>
              {analysis.repository.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {analysis.repository.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-xs">
                {analysis.repository.language && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                    {analysis.repository.language}
                  </span>
                )}
                {analysis.repository.stars > 0 && (
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                    ⭐ {analysis.repository.stars.toLocaleString()} stars
                  </span>
                )}
              </div>
            </div>

            {/* Technology Stack */}
            {analysis.analysis?.stack && (
              <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Technology Stack
                </h3>
                <div className="space-y-2 text-sm">
                  {analysis.analysis.stack.languages?.length > 0 && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Languages</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analysis.analysis.stack.languages.map((lang, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.analysis.stack.frameworks?.length > 0 && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Frameworks</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analysis.analysis.stack.frameworks.map((fw, i) => (
                          <span
                            key={i}
                            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs"
                          >
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.analysis.stack.databases?.length > 0 && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Databases</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analysis.analysis.stack.databases.map((db, i) => (
                          <span
                            key={i}
                            className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-xs"
                          >
                            {db}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.analysis.stack.tools?.length > 0 && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Tools</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analysis.analysis.stack.tools.map((tool, i) => (
                          <span
                            key={i}
                            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded text-xs"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insights */}
            {analysis.analysis?.insights?.length > 0 && (
              <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Insights</h3>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {analysis.analysis.insights.map((insight, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dependencies */}
            {analysis.analysis?.dependencies && (
              <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Dependencies</h3>
                <div className="space-y-2 text-sm">
                  {analysis.analysis.dependencies.production?.length > 0 && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                        Production
                      </p>
                      <p className="text-slate-700 dark:text-slate-400 text-xs mt-1">
                        {analysis.analysis.dependencies.production.slice(0, 5).join(', ')}
                        {analysis.analysis.dependencies.production.length > 5 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && !error && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Github className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter a GitHub repository URL to analyze its architecture</p>
          </div>
        )}
      </div>
    </div>
  );
}
