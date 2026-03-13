/**
 * AetherOS — Left Sidebar
 */
import React from 'react';
import {
  Layers, GitBranch, Shield, Zap, Search, ScrollText, Sparkles, Download
} from 'lucide-react';
import useStore from '../store/useStore';
import NodePalette from './panels/NodePalette';
import InferencePanel from './panels/InferencePanel';
import RulesPanel from './panels/RulesPanel';
import SimulationPanel from './panels/SimulationPanel';
import CbctPanel from './panels/CbctPanel';
import EventLogPanel from './panels/EventLogPanel';
import AiArchitectureAdvisorPanel from './panels/AiArchitectureAdvisorPanel';
import ArchitectureExportPanel from './panels/ArchitectureExportPanel';

const tabs = [
  { id: 'nodes', icon: Layers, label: 'Nodes' },
  { id: 'inference', icon: GitBranch, label: 'Infer' },
  { id: 'rules', icon: Shield, label: 'Rules' },
  { id: 'simulation', icon: Zap, label: 'Simulate' },
  { id: 'cbct', icon: Search, label: 'CBCT' },
  { id: 'events', icon: ScrollText, label: 'Events' },
  { id: 'ai-advisor', icon: Sparkles, label: 'AI Advisor' },
  { id: 'export', icon: Download, label: 'Export' }
];

export default function Sidebar() {
  const sidebarTab = useStore(s => s.sidebarTab);
  const setSidebarTab = useStore(s => s.setSidebarTab);
  const violations = useStore(s => s.violations);

  return (
    <div className="flex h-full shrink-0 mt-3 ml-2 mb-2 bg-transparent gap-2 pointer-events-none">
      {/* Icon rail */}
      <div className="w-14 glass-panel border border-aether-border flex flex-col items-center py-3 gap-2 pointer-events-auto shadow-2xl overflow-hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-full transition icon-container ${
              sidebarTab === tab.id
                ? 'bg-aether-accent/20 text-aether-accent border-aether-accent/50'
                : 'text-aether-muted hover:bg-aether-bg hover:text-aether-text'
            }`}
            title={tab.label}
          >
            <tab.icon size={18} />
            {tab.id === 'rules' && violations.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-aether-danger text-white text-[9px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                {violations.length > 9 ? '9+' : violations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="w-80 glass-panel border border-aether-border overflow-y-auto pointer-events-auto shadow-2xl mr-2">
        <div className="p-4">
          {sidebarTab === 'nodes' && <NodePalette />}
          {sidebarTab === 'inference' && <InferencePanel />}
          {sidebarTab === 'rules' && <RulesPanel />}
          {sidebarTab === 'simulation' && <SimulationPanel />}
          {sidebarTab === 'cbct' && <CbctPanel />}
          {sidebarTab === 'events' && <EventLogPanel />}
          {sidebarTab === 'ai-advisor' && <AiArchitectureAdvisorPanel />}
          {sidebarTab === 'export' && <ArchitectureExportPanel />}
        </div>
      </div>
    </div>
  );
}
