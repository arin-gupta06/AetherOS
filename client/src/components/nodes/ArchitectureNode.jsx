/**
 * AetherOS — Custom Architecture Node for React Flow
 */
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Server, Globe, Database, HardDrive, MessageSquare,
  Cog, Box, Shield, Monitor, Cpu
} from 'lucide-react';
import clsx from 'clsx';

const typeConfig = {
  service:   { icon: Server,        color: '#6366f1', bg: '#1e1b4b' },
  api:       { icon: Globe,         color: '#06b6d4', bg: '#083344' },
  database:  { icon: Database,      color: '#f59e0b', bg: '#451a03' },
  cache:     { icon: HardDrive,     color: '#10b981', bg: '#022c22' },
  queue:     { icon: MessageSquare, color: '#ec4899', bg: '#500724' },
  worker:    { icon: Cog,           color: '#8b5cf6', bg: '#2e1065' },
  runtime:   { icon: Cpu,           color: '#14b8a6', bg: '#042f2e' },
  container: { icon: Box,           color: '#3b82f6', bg: '#172554' },
  boundary:  { icon: Shield,        color: '#64748b', bg: '#0f172a' },
  frontend:  { icon: Monitor,       color: '#f472b6', bg: '#500724' }
};

const statusColors = {
  healthy:  '#10b981',
  degraded: '#f59e0b',
  failed:   '#ef4444',
  unknown:  '#64748b'
};

function ArchitectureNode({ data, selected }) {
  const nodeType = data.nodeType || 'service';
  const config = typeConfig[nodeType] || typeConfig.service;
  const Icon = config.icon;
  const status = data.status || 'healthy';
  const statusColor = statusColors[status] || statusColors.unknown;

  // Create a glow effect based on the node color
  const glowColor = selected ? config.color : `${config.color}20`; // Low opacity when not selected

  return (
    <div
      className={clsx(
        'relative min-w-45 h-full rounded-2xl border transition-all duration-300 group',
        selected ? 'border-transparent' : 'border-white/5'
      )}
      style={{
        background: `linear-gradient(145deg, ${config.bg}E6, ${config.bg}99)`, // Glassy gradient
        backdropFilter: 'blur(12px)',
        boxShadow: selected
          ? `0 0 25px ${config.color}60, inset 0 0 10px ${config.color}20` // Stronger glow when selected
          : `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)`, // Subtle depth
        borderColor: selected ? config.color : undefined
      }}
    >
      {/* Decorative top glow line */}
      <div 
        className="absolute top-0 left-4 right-4 h-px opacity-40"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`
        }}
      />

      {/* Status indicator (Pulsing Dot) */}
      <div className="absolute top-3 right-3 flex items-center justify-center">
        <div 
          className={clsx(
            "w-2 h-2 rounded-full shadow-lg",
            status === 'failed' && "animate-ping"
          )}
          style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
        />
        {status === 'failed' && (
          <div className="absolute w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Header with Icon Circle */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-inner ring-1 ring-white/10"
            style={{ 
              background: `linear-gradient(135deg, ${config.color}40, ${config.color}10)`,
              boxShadow: `0 0 10px ${config.color}30`
            }}
          >
            <Icon size={18} style={{ color: config.color, filter: `drop-shadow(0 0 2px ${config.color})` }} />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              {nodeType}
            </span>
            <span className="text-sm font-bold text-white tracking-wide truncate max-w-30" title={data.label}>
              {data.label || 'Unnamed'}
            </span>
          </div>
        </div>

        {/* Content / Badges */}
        {data.runtime && (
          <div className="flex items-center gap-2 mt-1">
            <div className="px-2 py-1 rounded-md bg-black/40 border border-white/5 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="text-[10px] text-white/70 font-mono tracking-tight">
                {data.runtime}
              </span>
            </div>
            {data.port && (
              <div className="px-2 py-1 rounded-md bg-black/40 border border-white/5">
                <span className="text-[10px] text-white/50 font-mono">
                  :{data.port}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Handles - Custom styling for clean connection points */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3! h-3! border-2! border-aether-bg! bg-white! transition-transform hover:scale-125"
        style={{ top: -6 }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3! h-3! border-2! border-aether-bg! bg-white! transition-transform hover:scale-125" 
        style={{ bottom: -6 }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3! h-3! border-2! border-aether-bg! bg-white! transition-transform hover:scale-125"
        style={{ left: -6 }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3! h-3! border-2! border-aether-bg! bg-white! transition-transform hover:scale-125" 
        style={{ right: -6 }}
      />
    </div>
  );
}

export default memo(ArchitectureNode);
