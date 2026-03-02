/**
 * AetherOS — Node Palette (drag-and-drop node creation)
 */
import React from 'react';
import {
  Server, Globe, Database, HardDrive, MessageSquare,
  Cog, Box, Shield, Monitor, Cpu
} from 'lucide-react';

const nodeTypes = [
  { type: 'service',   icon: Server,        label: 'Service',    color: '#6366f1' },
  { type: 'api',       icon: Globe,         label: 'API',        color: '#06b6d4' },
  { type: 'frontend',  icon: Monitor,       label: 'Frontend',   color: '#f472b6' },
  { type: 'database',  icon: Database,      label: 'Database',   color: '#f59e0b' },
  { type: 'cache',     icon: HardDrive,     label: 'Cache',      color: '#10b981' },
  { type: 'queue',     icon: MessageSquare, label: 'Queue',      color: '#ec4899' },
  { type: 'worker',    icon: Cog,           label: 'Worker',     color: '#8b5cf6' },
  { type: 'runtime',   icon: Cpu,           label: 'Runtime',    color: '#14b8a6' },
  { type: 'container', icon: Box,           label: 'Container',  color: '#3b82f6' },
  { type: 'boundary',  icon: Shield,        label: 'Boundary',   color: '#64748b' }
];

export default function NodePalette() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/aetheros-node-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-aether-muted mb-3">
        Component Palette
      </h3>
      <p className="text-[11px] text-aether-muted mb-4">
        Drag components onto the canvas to build your architecture.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {nodeTypes.map(nt => (
          <div
            key={nt.type}
            draggable
            onDragStart={(e) => onDragStart(e, nt.type)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-aether-border bg-aether-bg cursor-grab active:cursor-grabbing hover:border-opacity-60 transition group"
            style={{ borderColor: `${nt.color}33` }}
          >
            <nt.icon size={16} style={{ color: nt.color }} />
            <span className="text-xs text-aether-text group-hover:text-white transition">
              {nt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
