/**
 * Architecture Export Panel
 * Exports architecture as structured JSON for hackathon submission
 */

import React, { useState } from 'react';
import { Download, Copy, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

export default function ArchitectureExportPanel() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const setNotification = useStore(s => s.setNotification);

  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    if (nodes.length === 0) {
      setNotification('Add components to your architecture to export');
      return;
    }

    setLoading(true);
    try {
      const result = await api.exportArchitecture(nodes, edges);
      setExportData(result);
      setNotification('Architecture exported successfully');
    } catch (err) {
      setNotification('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;

    const json = JSON.stringify(exportData, null, 2);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(json)
    );
    element.setAttribute(
      'download',
      `architecture-${new Date().toISOString().split('T')[0]}.json`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setNotification('Architecture exported to file');
  };

  const handleCopy = () => {
    if (!exportData) return;

    const json = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setNotification('Architecture copied to clipboard');
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-aether-text flex items-center gap-2">
          <Download size={16} className="text-aether-accent" />
          Export Architecture
        </h3>
        <p className="text-xs text-aether-muted leading-relaxed">
          Export your architecture as structured JSON for hackathon submission and documentation.
        </p>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={loading || nodes.length === 0}
        className="w-full py-2.5 px-3 bg-gradient-to-r from-aether-accent to-aether-accent/80 hover:from-aether-accent/90 hover:to-aether-accent/70 disabled:from-aether-bg disabled:to-aether-bg disabled:text-aether-muted disabled:cursor-not-allowed text-sm font-semibold text-white rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={16} />
            Export Architecture Diagram
          </>
        )}
      </button>

      {/* Help Text */}
      {nodes.length === 0 && !exportData && (
        <div className="p-3 bg-aether-bg/50 border border-aether-border rounded-lg text-center">
          <p className="text-xs text-aether-muted">
            Design your architecture first, then export it.
          </p>
        </div>
      )}

      {/* Export Results */}
      {exportData && (
        <div className="space-y-3">
          {/* Success Status */}
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
            <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-400">Export Successful</p>
              <p className="text-[10px] text-green-300 mt-1">
                Architecture with {exportData.metadata.totalComponents} components and{' '}
                {exportData.metadata.totalConnections} connections
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-aether-text uppercase tracking-wide">
              Architecture Layers
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Frontend" value={exportData.metadata.layers.frontend} />
              <StatCard label="Backend" value={exportData.metadata.layers.backend} />
              <StatCard label="AI Services" value={exportData.metadata.layers.ai} />
              <StatCard label="Infrastructure" value={exportData.metadata.layers.infrastructure} />
              <StatCard label="Data" value={exportData.metadata.layers.data} />
              <StatCard label="Other" value={exportData.metadata.layers.other} />
            </div>
          </div>

          {/* Architecture Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-aether-text uppercase tracking-wide">
              Component Summary
            </h4>
            <div className="space-y-1.5 bg-aether-bg/50 p-3 rounded-lg border border-aether-border/30">
              {exportData.architecture.summary.client && (
                <SummaryItem label="Client" value={exportData.architecture.summary.client} />
              )}
              {exportData.architecture.summary.backend && (
                <SummaryItem label="Backend" value={exportData.architecture.summary.backend} />
              )}
              {exportData.architecture.summary.ai && (
                <SummaryItem label="AI" value={exportData.architecture.summary.ai} />
              )}
              {exportData.architecture.summary.data && (
                <SummaryItem label="Data" value={exportData.architecture.summary.data} />
              )}
              {exportData.architecture.summary.infrastructure && (
                <SummaryItem label="Infrastructure" value={exportData.architecture.summary.infrastructure} />
              )}
            </div>
          </div>

          {/* JSON Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-aether-text uppercase tracking-wide">
              JSON Export
            </h4>
            <div className="bg-aether-bg/50 border border-aether-border rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto p-3 font-mono text-[10px] text-aether-muted/80 leading-relaxed">
                {JSON.stringify(exportData, null, 2)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-aether-border/30">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 text-xs font-semibold rounded transition flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Download JSON
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 py-2 px-3 border text-xs font-semibold rounded transition flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 hover:border-purple-500/50 text-purple-400'
              }`}
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          {/* Diagram Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-aether-text uppercase tracking-wide">
              ASCII Diagram
            </h4>
            <div className="bg-aether-bg/50 border border-aether-border rounded-lg p-3 font-mono text-[9px] text-aether-muted/60 overflow-x-auto whitespace-pre">
              {exportData.diagram}
            </div>
          </div>

          {/* Export Time */}
          <div className="text-[10px] text-aether-muted/50 text-right">
            Exported at {new Date(exportData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ label, value }) {
  return (
    <div className="p-2 bg-aether-bg/50 rounded border border-aether-border/30 text-center">
      <div className="text-aether-muted text-[9px] uppercase font-semibold tracking-wide">{label}</div>
      <div className={`text-sm font-bold ${value > 0 ? 'text-aether-accent' : 'text-aether-muted/50'}`}>
        {value}
      </div>
    </div>
  );
}

/**
 * Summary item component
 */
function SummaryItem({ label, value }) {
  return (
    <div className="text-[11px] text-aether-text">
      <span className="font-semibold text-aether-accent">{label}:</span>{' '}
      <span className="text-aether-muted">{value}</span>
    </div>
  );
}
