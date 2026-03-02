/**
 * AetherOS — Notification Toast
 */
import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import useStore from '../store/useStore';

const severityMap = {
  success: { icon: CheckCircle, border: 'border-green-500/40', text: 'text-green-400', bg: 'bg-green-500/10' },
  error:   { icon: XCircle,     border: 'border-red-500/40',   text: 'text-red-400',   bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, border: 'border-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  info:    { icon: Info,         border: 'border-aether-border', text: 'text-aether-text', bg: '' }
};

function classifySeverity(msg) {
  if (!msg) return 'info';
  const lower = msg.toLowerCase();
  if (lower.includes('fail') || lower.includes('error')) return 'error';
  if (lower.includes('violation') || lower.includes('warning') || lower.includes('circular')) return 'warning';
  if (lower.includes('saved') || lower.includes('created') || lower.includes('complete') || lower.includes('inferred')) return 'success';
  return 'info';
}

export default function Notification() {
  const notification = useStore(s => s.notification);
  const setNotification = useStore(s => s.setNotification);

  if (!notification) return null;

  const severity = classifySeverity(notification);
  const config = severityMap[severity];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-start gap-2.5 px-4 py-2.5 rounded-lg bg-aether-surface border ${config.border} shadow-xl text-xs max-w-sm ${config.bg}`}>
        <Icon size={14} className={`${config.text} shrink-0 mt-0.5`} />
        <span className="text-aether-text flex-1">{notification}</span>
        <button
          onClick={() => setNotification(null)}
          className="text-aether-muted hover:text-aether-text transition shrink-0"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
