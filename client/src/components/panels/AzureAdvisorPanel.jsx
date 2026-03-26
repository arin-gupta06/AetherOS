/**
 * AI Advisor Panel
 * UI component for Azure OpenAI analysis and recommendations styled for AetherOS
 */

import React, { useState } from 'react';
import { Zap, Brain, AlertCircle, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
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
    <div>
      {/* Header */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-aether-muted mb-2 flex items-center gap-1.5">
        <Brain size={14} className="text-aether-accent" />
        AI Advisor
      </h3>
      <p className="text-[11px] text-aether-muted mb-4">
        AI-powered recommendations and analysis for your architecture
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['analysis', 'deployment', 'scalability'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center capitalize px-2 py-1.5 rounded text-[10px] font-medium transition ${
              activeTab === tab
                ? 'bg-aether-accent text-white'
                : 'bg-aether-bg border border-aether-border text-aether-text hover:border-aether-accent/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-aether-danger/10 border border-aether-danger/30 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-aether-danger flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-aether-danger/90">{error}</div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-3">
            <button
              onClick={handleAnalyzeArchitecture}
              disabled={loading || nodes.length === 0}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Zap size={14} /> Analyze Architecture</>
              )}
            </button>

            {analysis && (
              <div className="space-y-3 mt-3">
                {analysis.analysis?.recommendations && (
                  <div className="p-3 bg-aether-bg border border-aether-border rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-[11px] text-aether-text">
                      {(Array.isArray(analysis.analysis.recommendations)
                        ? analysis.analysis.recommendations
                        : []
                      ).map((rec, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.analysis?.risks && (
                  <div className="p-3 bg-aether-bg border border-aether-border rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Identified Risks</h4>
                    <ul className="space-y-2 text-[11px] text-aether-text">
                      {(Array.isArray(analysis.analysis.risks) ? analysis.analysis.risks : []).map(
                        (risk, i) => (
                          <li key={i} className="flex gap-2 leading-relaxed">
                            <AlertTriangle size={12} className="text-aether-warning mt-0.5 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {analysis.analysis?.analysis && (
                  <div className="p-3 bg-aether-bg border border-aether-border rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Detailed Analysis</h4>
                    <p className="text-[11px] text-aether-text whitespace-pre-wrap leading-relaxed">
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
          <div className="space-y-3">
            <button
              onClick={handleDeploymentSuggestion}
              disabled={loading || nodes.length === 0}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Zap size={14} /> Get Deployment Architecture</>
              )}
            </button>

            {deploymentSuggestion && (
              <div className="space-y-3 mt-3">
                {deploymentSuggestion.deploymentArchitecture?.services && (
                  <div className="p-3 bg-aether-bg border border-aether-border rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Recommended Services</h4>
                    <ul className="space-y-2 text-[11px] text-aether-text">
                      {deploymentSuggestion.deploymentArchitecture.services.map((svc, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <CheckCircle size={12} className="text-aether-success mt-0.5 flex-shrink-0" />
                          <span>{svc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {deploymentSuggestion.deploymentArchitecture?.rationale && (
                  <div className="p-3 bg-aether-bg border border-aether-border rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Rationale</h4>
                    <p className="text-[11px] text-aether-text leading-relaxed">
                      {deploymentSuggestion.deploymentArchitecture.rationale}
                    </p>
                  </div>
                )}

                {deploymentSuggestion.deploymentArchitecture?.estimatedCost && (
                  <div className="p-3 bg-aether-success/10 border border-aether-success/30 rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-success/80 mb-1">Estimated Cost</h4>
                    <p className="text-sm font-bold text-aether-success">
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
          <div className="space-y-3">
            <button
              onClick={handleScalabilityAnalysis}
              disabled={loading || nodes.length === 0}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-aether-accent text-white text-xs font-medium hover:bg-aether-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Zap size={14} /> Analyze Scalability</>
              )}
            </button>

            {scalabilityAnalysis && (
              <div className="space-y-3 mt-3">
                {scalabilityAnalysis.scalabilityAnalysis?.bottlenecks && (
                  <div className="p-3 bg-aether-bg border border-aether-danger/50 rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-danger mb-2">Bottlenecks</h4>
                    <ul className="space-y-2 text-[11px] text-aether-text">
                      {(
                        Array.isArray(scalabilityAnalysis.scalabilityAnalysis.bottlenecks)
                          ? scalabilityAnalysis.scalabilityAnalysis.bottlenecks
                          : []
                      ).map((bottleneck, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <AlertTriangle size={12} className="text-aether-danger mt-0.5 flex-shrink-0" />
                          <span>{bottleneck}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scalabilityAnalysis.scalabilityAnalysis?.solutions && (
                  <div className="p-3 bg-aether-bg border border-aether-border rounded-lg">
                    <h4 className="text-[10px] uppercase tracking-wider text-aether-muted mb-2">Solutions</h4>
                    <ul className="space-y-2 text-[11px] text-aether-text">
                      {(
                        Array.isArray(scalabilityAnalysis.scalabilityAnalysis.solutions)
                          ? scalabilityAnalysis.scalabilityAnalysis.solutions
                          : []
                      ).map((sol, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <CheckCircle size={12} className="text-aether-success mt-0.5 flex-shrink-0" />
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
