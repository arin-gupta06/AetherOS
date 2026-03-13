/**
 * AI Architecture Advisor Panel
 * Modern developer tool dashboard for architecture analysis
 */

import React, { useState } from 'react';
import {
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Shield,
  Loader,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

export default function AiArchitectureAdvisorPanel() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const setNotification = useStore(s => s.setNotification);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [expanded, setExpanded] = useState({
    summary: true,
    issues: true,
    optimization: true,
    resilience: true,
  });

  const handleAnalyze = async () => {
    if (nodes.length === 0) {
      setNotification('Add nodes to analyze architecture');
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyzeArchitecture(nodes, edges);
      setAnalysis(result);

      if (result.status === 'success') {
        setNotification('Architecture analysis complete');
      } else if (result.status === 'unconfigured') {
        setNotification('Azure OpenAI not configured - showing placeholder suggestions');
      }
    } catch (err) {
      setNotification('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-aether-text flex items-center gap-2">
          <Zap size={16} className="text-aether-accent" />
          AI Architecture Advisor
        </h3>
        <p className="text-xs text-aether-muted leading-relaxed">
          Analyze your architecture for scalability, resilience, and optimization opportunities.
        </p>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || nodes.length === 0}
        className="w-full py-2.5 px-3 bg-gradient-to-r from-aether-accent to-aether-accent/80 hover:from-aether-accent/90 hover:to-aether-accent/70 disabled:from-aether-bg disabled:to-aether-bg disabled:text-aether-muted disabled:cursor-not-allowed text-sm font-semibold text-white rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            Analyze Architecture
          </>
        )}
      </button>

      {/* No components message */}
      {nodes.length === 0 && !analysis && (
        <div className="p-3 bg-aether-bg/50 border border-aether-border rounded-lg text-center">
          <p className="text-xs text-aether-muted">
            Add components to your architecture to begin analysis.
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-3">
          {/* Status Message */}
          {analysis.status !== 'success' && (
            <div className="p-3 bg-aether-warning/20 border border-aether-warning/30 rounded-lg">
              <p className="text-xs text-aether-warning">
                {analysis.message}
              </p>
            </div>
          )}

          {/* Architecture Summary */}
          <ExpandableSection
            title="Architecture Summary"
            icon={<TrendingUp size={16} />}
            expanded={expanded.summary}
            onToggle={() => toggleSection('summary')}
            accentColor="from-blue-500 to-cyan-500"
          >
            <p className="text-xs text-aether-text leading-relaxed">
              {analysis.analysis || 'Your architecture is ready for analysis.'}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <StatItem label="Components" value={nodes.length} />
              <StatItem label="Connections" value={edges.length} />
            </div>
          </ExpandableSection>

          {/* Detected Issues */}
          {(analysis.recommendations?.scalability_risks?.length > 0 ||
            analysis.recommendations?.dependency_issues?.length > 0 ||
            analysis.recommendations?.potential_failure_points?.length > 0) && (
            <ExpandableSection
              title="Detected Issues"
              icon={<AlertCircle size={16} />}
              expanded={expanded.issues}
              onToggle={() => toggleSection('issues')}
              accentColor="from-red-500 to-orange-500"
              badge={
                (analysis.recommendations?.scalability_risks?.length || 0) +
                (analysis.recommendations?.dependency_issues?.length || 0) +
                (analysis.recommendations?.potential_failure_points?.length || 0)
              }
            >
              <div className="space-y-2">
                {analysis.recommendations?.scalability_risks?.length > 0 && (
                  <IssueSubSection
                    title="Scalability Risks"
                    items={analysis.recommendations.scalability_risks}
                  />
                )}
                {analysis.recommendations?.dependency_issues?.length > 0 && (
                  <IssueSubSection
                    title="Dependency Issues"
                    items={analysis.recommendations.dependency_issues}
                  />
                )}
                {analysis.recommendations?.potential_failure_points?.length > 0 && (
                  <IssueSubSection
                    title="Potential Failure Points"
                    items={analysis.recommendations.potential_failure_points}
                  />
                )}
              </div>
            </ExpandableSection>
          )}

          {/* Optimization Suggestions */}
          {analysis.recommendations?.optimization_opportunities?.length > 0 && (
            <ExpandableSection
              title="Optimization Suggestions"
              icon={<TrendingUp size={16} />}
              expanded={expanded.optimization}
              onToggle={() => toggleSection('optimization')}
              accentColor="from-yellow-500 to-amber-500"
              badge={analysis.recommendations.optimization_opportunities.length}
            >
              <ul className="space-y-2">
                {analysis.recommendations.optimization_opportunities.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-[11px] text-aether-text p-2 bg-aether-bg/50 border border-aether-border/30 rounded"
                  >
                    <span className="text-aether-accent font-bold shrink-0">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Resilience Improvements */}
          {analysis.recommendations?.resilience_recommendations?.length > 0 && (
            <ExpandableSection
              title="Resilience Improvements"
              icon={<Shield size={16} />}
              expanded={expanded.resilience}
              onToggle={() => toggleSection('resilience')}
              accentColor="from-green-500 to-emerald-500"
              badge={analysis.recommendations.resilience_recommendations.length}
            >
              <ul className="space-y-2">
                {analysis.recommendations.resilience_recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-[11px] text-aether-text p-2 bg-aether-bg/50 border border-aether-border/30 rounded"
                  >
                    <span className="text-green-400 font-bold shrink-0">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Timestamp */}
          <div className="text-[10px] text-aether-muted/50 text-right pt-2 border-t border-aether-border/30">
            Analyzed at {new Date(analysis.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable expandable section component
 */
function ExpandableSection({
  title,
  icon,
  expanded,
  onToggle,
  accentColor,
  badge,
  children,
}) {
  return (
    <div className="border border-aether-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 bg-gradient-to-r ${accentColor} bg-opacity-5 hover:bg-opacity-10 transition font-semibold text-sm text-aether-text`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
          {badge > 0 && (
            <span className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-gradient-to-r ${accentColor} text-white`}>
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-aether-accent shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-aether-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-2 bg-aether-bg/30 border-t border-aether-border">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Issue subsection component
 */
function IssueSubSection({ title, items }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[10px] font-semibold text-aether-muted uppercase tracking-wide">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex gap-2 text-[11px] text-aether-text p-2 bg-aether-bg/50 border border-aether-border/30 rounded"
          >
            <span className="text-aether-danger font-bold shrink-0">⚠</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Stat item component (for summary section)
 */
function StatItem({ label, value }) {
  return (
    <div className="p-2 bg-aether-bg/50 rounded border border-aether-border/30 text-center">
      <div className="text-aether-muted text-[10px] uppercase font-semibold tracking-wide">
        {label}
      </div>
      <div className="text-aether-accent text-lg font-bold">{value}</div>
    </div>
  );
}
