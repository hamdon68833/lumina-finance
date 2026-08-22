import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { SmartAlert } from '../../alert_rules';
import { SmartAlertCard } from './SmartAlertCard';

interface MarketAlertPanelProps {
  alerts: SmartAlert[];
  unreadCount: number;
  onOpenNotificationCenter: () => void;
  onActionClick: (alert: SmartAlert) => void;
  onMarkRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export const MarketAlertPanel: React.FC<MarketAlertPanelProps> = ({
  alerts,
  unreadCount,
  onOpenNotificationCenter,
  onActionClick,
  onMarkRead,
  onDismiss,
}) => {
  const topAlerts = alerts.slice(0, 2);

  return (
    <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-[#fafafa] shadow-sm space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Proactive Smart Alert Center</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                ACTIVE MONITORING
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Real-time personalized market & financial risk alerts.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNotificationCenter}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>View All ({alerts.length})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Feed */}
      {topAlerts.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-zinc-400">
          No active risk alerts. Your portfolio and reserves are currently stable.
        </div>
      ) : (
        <div className="space-y-3">
          {topAlerts.map((alert) => (
            <SmartAlertCard
              key={alert.id}
              alert={alert}
              onActionClick={onActionClick}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
};
