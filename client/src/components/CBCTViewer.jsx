/**
 * CBCT Viewer Component
 * 
 * Displays CBCT in an iframe with:
 * - Smooth loading animation
 * - Back button to return to architecture
 * - Breadcrumb navigation
 * - Integration with AetherOS theme
 */

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Code2 } from 'lucide-react';

const CBCTViewer = ({ 
  url, 
  nodeLabel = 'Code View',
  onBack,
  isLoading = false 
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-aether-bg">
        <div className="text-center">
          <Code2 size={48} className="text-aether-muted mx-auto mb-4" />
          <p className="text-aether-text/70">No repository loaded</p>
          <p className="text-sm text-aether-muted mt-2">
            Load a repository to inspect code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative bg-aether-bg overflow-hidden">
      {/* Navigation Header */}
      <div className="h-16 bg-gradient-to-b from-aether-bg/95 to-aether-bg/70 backdrop-blur-md border-b border-aether-border flex items-center px-6 gap-4 flex-shrink-0 z-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-aether-accent/10 hover:bg-aether-accent/20 text-aether-accent font-medium transition-all duration-200 group"
          title="Return to Architecture"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Architecture</span>
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-aether-text/70 flex-1">
          <Code2 size={16} className="text-aether-accent" />
          <span>Inspecting:</span>
          <code className="text-aether-accent font-mono text-xs bg-aether-surface px-2.5 py-1 rounded border border-aether-border/50">
            {nodeLabel}
          </code>
        </div>

        {/* Loading Indicator */}
        {!iframeLoaded && (
          <div className="flex items-center gap-2 text-xs text-aether-muted">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" />
              <div 
                className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" 
                style={{ animationDelay: '0.2s' }} 
              />
              <div 
                className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" 
                style={{ animationDelay: '0.4s' }} 
              />
            </div>
            <span>Loading code map...</span>
          </div>
        )}
      </div>

      {/* CBCT iframe Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* Loading Overlay */}
        {!iframeLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-aether-bg/50 to-aether-bg/20 flex items-center justify-center z-5 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-lg border-2 border-aether-accent/20" />
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent border-t-aether-accent border-r-aether-accent animate-spin" />
                </div>
                <p className="text-sm text-aether-text/70 font-medium">Analyzing codebase...</p>
              </div>
            </div>
          </div>
        )}

        {/* CBCT iframe */}
        <iframe
          src={url}
          title="CBCT Code Map"
          className="w-full h-full border-none bg-white"
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>

      {/* Ambient Background Gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-10 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-aether-accent/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
      </div>
    </div>
  );
};

export default CBCTViewer;
