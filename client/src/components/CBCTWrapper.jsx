/**
 * AetherOS × CBCT Integration Wrapper
 * 
 * Seamlessly embeds CBCT as a CODE view mode
 * - Skips welcome screen when repoPath provided
 * - Auto-triggers analysis
 * - Provides back-to-architecture navigation
 * - Matches AetherOS theming
 */

import React, { useEffect, useCallback } from 'react';
import CBCTApp from '@/App';
import { useStore as useCBCTStore } from '@/store/useStore';
import useStore from '../store/useStore';
import { ArrowLeft, ZoomIn } from 'lucide-react';
import { cacheService, cacheKeys } from '../services/cache';

export default function CBCTWrapper({ nodeId, repoPath }) {
  const exitCodeView = useStore(s => s.exitCodeView);
  const applyCBCTDataToNodes = useStore(s => s.applyCBCTDataToNodes);
  const cbctActiveNodeId = useStore(s => s.cbctActiveNodeId);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const nodes = useStore(s => s.nodes);
  
  const cbctLoading = useCBCTStore(s => s.isLoading);
  const cbctRepositoryPath = useCBCTStore(s => s.repositoryPath);
  const cbctGraphData = useCBCTStore(s => s.graphData);
  const cbctMetrics = useCBCTStore(s => s.complexityData);
  const setRepositoryPath = useCBCTStore(s => s.setRepositoryPath);
  const focusUnit = useCBCTStore(s => s.focusUnit);
  
  // Synchronize with CBCT store when component mounts or props change
  useEffect(() => {
    if (repoPath) {
      // Set repository path to trigger analysis
      setRepositoryPath(repoPath);
    }
  }, [repoPath, setRepositoryPath]);

  // Focus on the specific node after graph loads
  useEffect(() => {
    if (nodeId && cbctRepositoryPath === repoPath && !cbctLoading) {
      // Small delay to ensure graph renders
      const timeout = setTimeout(() => {
        focusUnit({ id: nodeId }, 2);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [nodeId, repoPath, cbctRepositoryPath, cbctLoading, focusUnit]);

  // Handle exit from CODE view
  const handleExitCodeView = useCallback(() => {
    // Apply CBCT data to nodes before exiting
    if (cbctGraphData && repoPath) {
      applyCBCTDataToNodes(repoPath, {
        graphData: cbctGraphData,
        metrics: cbctMetrics
      });
    }
    exitCodeView();
  }, [cbctGraphData, cbctMetrics, repoPath, applyCBCTDataToNodes, exitCodeView]);

  // Get the current node label for breadcrumb
  const currentNode = nodes.find(n => n.id === nodeId);
  const nodeLabel = currentNode?.data?.label || 'Code View';

  return (
    <div className="w-full h-full relative overflow-hidden bg-cbct-bg flex flex-col">
      {/* Navigation Bar - Seamless Integration */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-aether-bg/80 to-aether-bg/40 backdrop-blur-lg border-b border-aether-border z-[9999] flex items-center px-6 gap-6">
        {/* Back Button */}
        <button
          onClick={handleExitCodeView}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-aether-accent/10 hover:bg-aether-accent/20 text-aether-text font-medium transition-all duration-200 group"
          title="Return to Architecture Canvas"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Architecture</span>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-aether-text/70">
          <ZoomIn size={16} className="text-aether-accent" />
          <span>Inspecting:</span>
          <code className="text-aether-accent font-mono text-xs bg-aether-surface px-2 py-1 rounded">
            {nodeLabel}
          </code>
        </div>

        {/* Analysis Status */}
        {cbctLoading && (
          <div className="ml-auto flex items-center gap-2 text-sm text-aether-muted">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs">Analyzing codebase...</span>
          </div>
        )}
      </div>

      {/* Embedded CBCT Graph Canvas */}
      <div className="flex-1 w-full h-full pt-16 relative overflow-hidden">
        {/* CSS to deeply embed CBCT and hide unnecessary UI */}
        <style>{`
          /* Hide CBCT's own header since we have our own */
          .cbct-embedded-container header,
          .cbct-embedded-container nav,
          .CBCT-Header {
            display: none !important;
          }
          
          /* Remove padding from CBCT containers */
          .cbct-embedded-container main,
          .cbct-embedded-container .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Full canvas */
          .cbct-embedded-container {
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>

        <div className="w-full h-full cbct-embedded-container">
          <CBCTApp embeddedMode={true} repoPath={repoPath} />
        </div>
      </div>

      {/* Ambient Background - AetherOS Theming */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-aether-accent/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      </div>
    </div>
  );
}
