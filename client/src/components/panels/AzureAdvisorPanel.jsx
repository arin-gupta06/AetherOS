/**
 * Azure Architecture Advisor Panel
 * UI component for Azure OpenAI analysis and recommendations
 */

import React, { useState } from 'react';
import { Zap, Brain, AlertCircle } from 'lucide-react';
import {
  analyzeArchitectureWithAzure,
  getAzureDeploymentSuggestion,
  analyzeScalabilityWithAzure,
} from '../../lib/azureApi';
import useStore from '../../store/useStore';

export default function AzureAdvisorPanel() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  // Build a serializable architecture description from the current canvas
  const architecture = nodes.map(n => ({ id: n.id, label: n.data?.label, type: n.data?.nodeType }));

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [deploymentSuggestion, setDeploymentSuggestion] = useState(null);
  const [scalabilityAnalysis, setScalabilityAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  const handleAnalyzeArchitecture = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeArchitectureWithAzure(architecture, nodes, edges);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploymentSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAzureDeploymentSuggestion(architecture);
      setDeploymentSuggestion(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScalabilityAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeScalabilityWithAzure(architecture);
      setScalabilityAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Azure Architecture Advisor
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          AI-powered recommendations powered by Azure OpenAI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            activeTab === 'analysis'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            activeTab === 'deployment'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          Deployment
        </button>
        <button
          onClick={() => setActiveTab('scalability')}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            activeTab === 'scalability'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          Scalability
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <button
              onClick={handleAnalyzeArchitecture}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Analyze Architecture'}
            </button>

            {analysis && (
              <div className="space-y-3">
                {analysis.analysis?.recommendations && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Recommendations
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {(Array.isArray(analysis.analysis.recommendations)
                        ? analysis.analysis.recommendations
                        : []
                      ).map((rec, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.analysis?.risks && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Identified Risks
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {(Array.isArray(analysis.analysis.risks) ? analysis.analysis.risks : []).map(
                        (risk, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-amber-600">⚠</span>
                            <span>{risk}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {analysis.analysis?.analysis && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Analysis</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {analysis.analysis.analysis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Deployment Tab */}
        {activeTab === 'deployment' && (
          <div className="space-y-4">
            <button
              onClick={handleDeploymentSuggestion}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Generating...' : 'Get Deployment Architecture'}
            </button>

            {deploymentSuggestion && (
              <div className="space-y-3">
                {deploymentSuggestion.deploymentArchitecture?.services && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Recommended Services
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {deploymentSuggestion.deploymentArchitecture.services.map((svc, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{svc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {deploymentSuggestion.deploymentArchitecture?.rationale && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Rationale</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {deploymentSuggestion.deploymentArchitecture.rationale}
                    </p>
                  </div>
                )}

                {deploymentSuggestion.deploymentArchitecture?.estimatedCost && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Estimated Cost
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {deploymentSuggestion.deploymentArchitecture.estimatedCost}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scalability Tab */}
        {activeTab === 'scalability' && (
          <div className="space-y-4">
            <button
              onClick={handleScalabilityAnalysis}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Analyze Scalability'}
            </button>

            {scalabilityAnalysis && (
              <div className="space-y-3">
                {scalabilityAnalysis.scalabilityAnalysis?.bottlenecks && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-red-700 dark:text-red-400">
                      Bottlenecks
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {(
                        Array.isArray(scalabilityAnalysis.scalabilityAnalysis.bottlenecks)
                          ? scalabilityAnalysis.scalabilityAnalysis.bottlenecks
                          : []
                      ).map((bottleneck, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-red-600">⚠</span>
                          <span>{bottleneck}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scalabilityAnalysis.scalabilityAnalysis?.solutions && (
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Solutions
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {(
                        Array.isArray(scalabilityAnalysis.scalabilityAnalysis.solutions)
                          ? scalabilityAnalysis.scalabilityAnalysis.solutions
                          : []
                      ).map((sol, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
