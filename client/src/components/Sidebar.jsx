/**
 * AetherOS — Left Sidebar
 */
import React from 'react';
import {
  Layers, GitBranch, Shield, Zap, Search, ScrollText
} from 'lucide-react';
import useStore from '../store/useStore';
import NodePalette from './panels/NodePalette';
import InferencePanel from './panels/InferencePanel';
import RulesPanel from './panels/RulesPanel';
import SimulationPanel from './panels/SimulationPanel';
import CbctPanel from './panels/CbctPanel';
import EventLogPanel from './panels/EventLogPanel';

const tabs = [
  { id: 'nodes', icon: Layers, label: 'Nodes' },
  { id: 'inference', icon: GitBranch, label: 'Infer' },
  { id: 'rules', icon: Shield, label: 'Rules' },
  { id: 'simulation', icon: Zap, label: 'Simulate' },
  { id: 'cbct', icon: Search, label: 'CBCT' },
  { id: 'events', icon: ScrollText, label: 'Events' }
];

export default function Sidebar() {
  const sidebarTab = useStore(s => s.sidebarTab);
  const setSidebarTab = useStore(s => s.setSidebarTab);
  const violations = useStore(s => s.violations);

  return (
    <div className="flex h-full shrink-0">
      {/* Icon rail */}
      <div className="w-12 bg-aether-surface border-r border-aether-border flex flex-col items-center py-2 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition ${
              sidebarTab === tab.id
                ? 'bg-aether-accent/20 text-aether-accent'
                : 'text-aether-muted hover:bg-aether-bg hover:text-aether-text'
            }`}
            title={tab.label}
          >
            <tab.icon size={18} />
            {tab.id === 'rules' && violations.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-aether-danger text-white text-[9px] flex items-center justify-center font-bold">
                {violations.length > 9 ? '9+' : violations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="w-72 bg-aether-surface border-r border-aether-border overflow-y-auto">
        <div className="p-3">
          {sidebarTab === 'nodes' && <NodePalette />}
          {sidebarTab === 'inference' && <InferencePanel />}
          {sidebarTab === 'rules' && <RulesPanel />}
          {sidebarTab === 'simulation' && <SimulationPanel />}
          {sidebarTab === 'cbct' && <CbctPanel />}
          {sidebarTab === 'events' && <EventLogPanel />}
        </div>
      </div>
    </div>
  );
}
