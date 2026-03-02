/**
 * AetherOS — Event Log Panel
 * Centralized architectural event stream.
 */
import React, { useState } from 'react';
import { ScrollText, Trash2, Filter } from 'lucide-react';
import useStore from '../../store/useStore';

const eventTypeColors = {
  'node-added': '#10b981',
  'node-removed': '#ef4444',
  'node-updated': '#6366f1',
  'edge-added': '#06b6d4',
  'edge-removed': '#ef4444',
  'rule-violation': '#f59e0b',
  'rule-added': '#8b5cf6',
  'rule-removed': '#ef4444',
  'simulation-started': '#f97316',
  'simulation-ended': '#10b981',
  'failure-injected': '#ef4444',
  'failure-propagated': '#f59e0b',
  'runtime-assigned': '#14b8a6',
  'architecture-inferred': '#6366f1',
  'architecture-reset': '#64748b'
};

const severityFilters = ['all', 'error', 'warning', 'info'];

export default function EventLogPanel() {
  const events = useStore(s => s.events);
  const [severityFilter, setSeverityFilter] = useState('all');

  const clearEvents = () => {
    useStore.setState({ events: [] });
  };

  const filtered = severityFilter === 'all'
    ? events
    : events.filter(e => e.severity === severityFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-aether-muted uppercase tracking-wider">
          Event Log
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-aether-muted font-mono">{filtered.length}</span>
          <button
            onClick={clearEvents}
            className="text-aether-muted hover:text-aether-danger transition"
            title="Clear all events"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Severity filter */}
      <div className="flex gap-1 mb-3">
        {severityFilters.map(sf => (
          <button
            key={sf}
            onClick={() => setSeverityFilter(sf)}
            className={`px-2 py-0.5 rounded text-[10px] capitalize transition border ${
              severityFilter === sf
                ? 'border-aether-accent/50 bg-aether-accent/10 text-aether-accent'
                : 'border-aether-border text-aether-muted hover:text-aether-text'
            }`}
          >
            {sf}
          </button>
        ))}
      </div>

      <div className="space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-aether-muted italic">No events recorded yet.</p>
        ) : (
          [...filtered].reverse().slice(0, 200).map(event => (
            <div
              key={event.id}
              className="p-2 rounded-lg bg-aether-bg border border-aether-border"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: eventTypeColors[event.type] || '#64748b' }}
                />
                <span className="text-[11px] font-medium text-aether-text truncate">
                  {event.type}
                </span>
                <span className="text-[9px] text-aether-muted ml-auto font-mono shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.payload && Object.keys(event.payload).length > 0 && (
                <div className="text-[10px] text-aether-muted font-mono mt-0.5 truncate pl-3.5">
                  {Object.entries(event.payload)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                    .join(' · ')
                  }
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
