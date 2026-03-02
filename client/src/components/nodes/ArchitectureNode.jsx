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

  return (
    <div
      className={clsx(
        'relative px-4 py-3 rounded-lg border min-w-[180px] transition-all duration-200',
        selected && 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#0a0a0f]',
        status === 'failed' && 'animate-pulse'
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: selected ? config.color : `${config.color}44`,
        boxShadow: status === 'failed'
          ? `0 0 20px ${statusColor}40`
          : selected
            ? `0 0 15px ${config.color}30`
            : 'none'
      }}
    >
      {/* Status indicator */}
      <div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0f]"
        style={{ backgroundColor: statusColor }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} style={{ color: config.color }} />
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: config.color }}>
          {nodeType}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-white truncate">
        {data.label || 'Unnamed'}
      </div>

      {/* Runtime badge */}
      {data.runtime && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
            {data.runtime}
          </span>
          {data.port && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono">
              :{data.port}
            </span>
          )}
        </div>
      )}

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-indigo-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-indigo-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(ArchitectureNode);
