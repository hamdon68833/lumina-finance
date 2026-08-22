import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  RefreshCw, 
  Settings, 
  SlidersHorizontal, 
  ShieldAlert, 
  Play 
} from 'lucide-react';
import { SmartAlert, AlertSeverity, UserAlertPreferences } from '../../alert_rules';
import { SmartAlertCard } from './SmartAlertCard';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SmartAlert[];
  unreadCount: number;
  onMarkRead: (alertId: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (alertId: string) => void;
  onEvaluate: () => void;
  onTriggerDemo: (demoType: 'NVIDIA_DROP' | 'EMERGENCY_LOW' | 'EQUITY_DRIFT') => void;
  onActionClick: (action: string, alert: SmartAlert) => void;
  preferences: UserAlertPreferences;
  onUpdatePreferences: (prefs: Partial<UserAlertPreferences>) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onEvaluate,
  onTriggerDemo,
  onActionClick,
  preferences,
  onUpdatePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PREFERENCES'>('ALERTS');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedType !== 'ALL' && a.type !== selectedType) return false;
    return true;
  });

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    await onEvaluate();
    setTimeout(() => setIsEvaluating(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-[#09090b] border-l border-white/10 h-full flex flex-col shadow-2xl text-[#fafafa]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Smart Alerts & Action Center</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PROACTIVE AI
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monitoring market events & personalized financial risk thresholds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Header & Control Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ALERTS' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts ({alerts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PREFERENCES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'PREFERENCES' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Rules</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>Evaluate Now</span>
            </button>
          </div>
        </div>

        {/* ALERTS TAB CONTENT */}
        {activeTab === 'ALERTS' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Demo Event Trigger Bar for Viva */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <Play className="w-4 h-4 text-purple-400" />
                <span>Viva Demo Event Trigger:</span>
              </div>
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  onClick={() => onTriggerDemo('NVIDIA_DROP')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-colors"
                >
                  NVDA -7.2% Drop
                </button>
                <button
                  onClick={() => onTriggerDemo('EMERGENCY_LOW')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors"
                >
                  Reserve &lt; 3 Mos
                </button>
                <button
                  onClick={() => onTriggerDemo('EQUITY_DRIFT')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors"
                >
                  Equity Drift 72%
                </button>
              </div>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center flex-wrap gap-1.5 pb-2 border-b border-white/10">
              <span className="text-xs text-zinc-500 flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Severity:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider transition-colors ${
                    selectedSeverity === sev
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-white/10'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
                <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-zinc-300">No active alerts found</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  All financial health indicators, risk levels, and market monitoring rules are currently within safety benchmarks.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredAlerts.map(alert => (
                  <SmartAlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkRead={onMarkRead}
                    onDismiss={onDismiss}
                    onActionClick={onActionClick}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* PREFERENCES TAB CONTENT */
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-100">User Alert Preferences & Thresholds</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure which event categories Lumina should monitor and evaluate for your profile.
              </p>
            </div>

            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-white/10">
              {[
                { key: 'marketAlerts', label: 'Market Volatility & Stock Alerts', desc: 'Price drops >5%, RSI extremes, market news.' },
                { key: 'portfolioAlerts', label: 'Portfolio Concentration & Risk', desc: 'Asset concentration >20%, risk rating updates.' },
                { key: 'emergencyAlerts', label: 'Emergency Safety Reserve Alerts', desc: 'Liquid reserves falling below 3 or 6 months.' },
                { key: 'goalAlerts', label: 'Financial Goal Deviation Alerts', desc: 'Projected completion delays and monthly shortfalls.' },
                { key: 'budgetAlerts', label: 'Budget & Expense Spikes', desc: 'Expense category spikes exceeding 25% baseline.' },
                { key: 'debtAlerts', label: 'Debt & DTI Ratio Alerts', desc: 'Debt-to-income ratio exceeding safe 40% threshold.' },
                { key: 'opportunityAlerts', label: 'Asset Allocation Opportunities', desc: 'Under-allocated asset targets and cash drag.' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-white/5">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">{item.label}</span>
                    <span className="text-[11px] text-zinc-500">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean((preferences as any)[item.key])}
                    onChange={e => onUpdatePreferences({ [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Minimum Severity Filter */}
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
              <label className="text-xs font-bold text-zinc-200 block mb-1">
                Minimum Notification Severity Level
              </label>
              <p className="text-xs text-zinc-400 mb-3">
                Lumina will filter out any alerts below this severity.
              </p>
              <select
                value={preferences.minimumSeverity}
                onChange={e => onUpdatePreferences({ minimumSeverity: e.target.value as AlertSeverity })}
                className="w-full bg-zinc-950 text-xs font-semibold text-zinc-200 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="INFO">INFO (All alerts & educational updates)</option>
                <option value="LOW">LOW (Low drift & minor technical changes)</option>
                <option value="MEDIUM">MEDIUM (Moderate goal delays & budget spikes)</option>
                <option value="HIGH">HIGH (High asset concentration & high DTI)</option>
                <option value="CRITICAL">CRITICAL (Only urgent safety reserve warnings)</option>
              </select>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-zinc-950 text-center text-[10px] text-zinc-500">
          <span>Decision-Support System • Lumina AI does NOT execute financial transactions • VTU BE ISE Project</span>
        </div>
      </div>
    </div>
  );
};
