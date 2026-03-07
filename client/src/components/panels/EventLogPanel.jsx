/**
 * AetherOS — Event Log Panel
 * Centralized architectural event stream.
 */
import React, { useState, useEffect } from 'react';
import { ScrollText, Trash2, Filter, RefreshCw } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

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
  const [syncing, setSyncing] = useState(false);

  // Load events from backend on mount and merge with local
  useEffect(() => {
    api.getEvents({ limit: 200 }).then(serverEvents => {
      useStore.setState(state => {
        const localIds = new Set(state.events.map(e => e.id));
        const newEvents = serverEvents.filter(e => !localIds.has(e.id));
        if (newEvents.length === 0) return state;
        const merged = [...state.events, ...newEvents]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-1000);
        return { events: merged };
      });
    }).catch(() => {});
  }, []);

  const handleSync = () => {
    setSyncing(true);
    api.getEvents({ limit: 200 }).then(serverEvents => {
      useStore.setState(state => {
        const localIds = new Set(state.events.map(e => e.id));
        const newEvents = serverEvents.filter(e => !localIds.has(e.id));
        if (newEvents.length === 0) return state;
        const merged = [...state.events, ...newEvents]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-1000);
        return { events: merged };
      });
    }).catch(() => {}).finally(() => setSyncing(false));
  };

  const clearEvents = () => {
    api.getEvents().then(() => api.postEvent({ type: 'noop' })).catch(() => {});
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
            onClick={handleSync}
            disabled={syncing}
            className="text-aether-muted hover:text-aether-accent transition disabled:opacity-50"
            title="Sync events from server"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          </button>
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
