import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { SmartAlert, AlertSeverity } from '../../alert_rules';

interface SmartAlertCardProps {
  alert: SmartAlert;
  onActionClick?: (alert: SmartAlert) => void;
  onMarkRead?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

export const SmartAlertCard: React.FC<SmartAlertCardProps> = ({
  alert,
  onActionClick,
  onMarkRead,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 animate-pulse',
          border: 'border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/10 hover:border-rose-300 dark:hover:border-rose-500/60',
          iconBg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
        };
      case 'HIGH':
        return {
          badge: 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/40',
          border: 'border-orange-200 dark:border-orange-500/40 bg-orange-50/50 dark:bg-orange-950/10 hover:border-orange-300 dark:hover:border-orange-500/60',
          iconBg: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
          border: 'border-amber-200 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/10 hover:border-amber-300 dark:hover:border-amber-500/60',
          iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
        };
      case 'LOW':
        return {
          badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40',
          border: 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/10 hover:border-blue-300 dark:hover:border-blue-500/50',
          iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
        };
      default:
        return {
          badge: 'bg-slate-100 dark:bg-zinc-500/20 text-slate-800 dark:text-zinc-300 border-slate-300 dark:border-zinc-500/40',
          border: 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700',
          iconBg: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'MARKET':
        return <TrendingDown className="w-5 h-5" />;
      case 'EMERGENCY_FUND':
        return <ShieldAlert className="w-5 h-5" />;
      case 'GOAL':
        return <Target className="w-5 h-5" />;
      case 'PORTFOLIO':
        return <BarChart2 className="w-5 h-5" />;
      case 'BUDGET':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const severityStyle = getSeverityStyle(alert.severity);

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 shadow-sm ${severityStyle.border} ${
        !alert.isRead ? 'ring-1 ring-blue-500/30' : 'opacity-90'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${severityStyle.iconBg}`}>
            {getAlertIcon(alert.type)}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border uppercase ${severityStyle.badge}`}>
                {alert.severity}
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 uppercase">
                {alert.type.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">{alert.title}</h4>
          </div>
        </div>

        {/* Action Controls (Dismiss / Mark Read) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!alert.isRead && onMarkRead && (
            <button
              onClick={() => onMarkRead(alert.id)}
              title="Mark as Read"
              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              title="Dismiss Alert"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Description */}
      <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
        {alert.message}
      </p>

      {/* Expand / Details Toggle */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>{expanded ? 'Hide Details' : 'View Impact Details'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {onActionClick && (
          <button
            onClick={() => onActionClick(alert)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
          >
            Analyze Action
          </button>
        )}
      </div>

      {/* Expanded Metrics Section */}
      {expanded && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
            <span>Triggered At:</span>
            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
          {alert.triggerCondition && (
            <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
              <span>Condition:</span>
              <span className="text-slate-800 dark:text-zinc-200 font-bold">{alert.triggerCondition}</span>
            </div>
          )}
          {alert.contextSnapshot && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">User Context Snapshot</span>
              <pre className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 p-2 rounded border border-slate-200 dark:border-white/5 overflow-x-auto">
                {JSON.stringify(alert.contextSnapshot, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
