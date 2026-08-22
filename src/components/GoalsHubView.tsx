import React from 'react';
import { Target, Home, GraduationCap, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatINR, formatINRMonthly } from '../utils/formatters';

interface GoalsHubViewProps {
  userContext: any;
  onOpenCopilot: (prompt?: string) => void;
}

export const GoalsHubView: React.FC<GoalsHubViewProps> = ({ userContext, onOpenCopilot }) => {
  const goals = userContext.goals || [
    {
      id: "g1",
      name: "House Downpayment Goal",
      category: "House",
      icon: Home,
      targetAmount: 1500000,
      currentSavings: 300000,
      monthsLeft: 36,
      requiredMonthly: 33300,
      currentMonthly: 25000,
      status: "NEEDS ATTENTION"
    },
    {
      id: "g2",
      name: "Emergency Reserve Goal",
      category: "Emergency",
      icon: Target,
      targetAmount: 300000,
      currentSavings: 180000,
      monthsLeft: 12,
      requiredMonthly: 10000,
      currentMonthly: 10000,
      status: "ON TRACK"
    },
    {
      id: "g3",
      name: "Higher Education Fund",
      category: "Education",
      icon: GraduationCap,
      targetAmount: 800000,
      currentSavings: 150000,
      monthsLeft: 24,
      requiredMonthly: 27000,
      currentMonthly: 20000,
      status: "AT RISK"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Financial Goal Roadmap
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Target Milestones, Timeline Projections & Monthly Contribution Optimization</p>
        </div>

        <button
          onClick={() => onOpenCopilot('How can I reach my house goal faster?')}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-950/40 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Optimize All Goals
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {goals.map((goal: any, idx: number) => {
          const target = goal.targetAmount || 1500000;
          const current = goal.currentSavings || 300000;
          const remaining = Math.max(0, target - current);
          const pct = Math.min(100, Math.round((current / target) * 100));

          const statusColor = goal.status === 'ON TRACK' ? 'emerald' : goal.status === 'NEEDS ATTENTION' ? 'amber' : 'rose';

          return (
            <div key={idx} className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">{goal.name}</span>
                  <span className={`text-[10px] font-mono font-bold bg-${statusColor}-100 dark:bg-${statusColor}-500/20 text-${statusColor}-800 dark:text-${statusColor}-300 border border-${statusColor}-200 dark:border-${statusColor}-500/30 px-2 py-0.5 rounded-full uppercase`}>
                    {goal.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                    <span>Saved: {formatINR(current)}</span>
                    <span>Target: {formatINR(target)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 pt-0.5">
                    <span>{pct}% Completed</span>
                    <span>Remaining: {formatINR(remaining)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                    <span>Current Contribution:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINRMonthly(goal.currentMonthly || 25000)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                    <span>Required Contribution:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{formatINRMonthly(goal.requiredMonthly || 33300)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px] pt-1 border-t border-slate-200 dark:border-white/5 font-mono">
                    <span>Timeline Left:</span>
                    <span>{goal.monthsLeft} Months</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenCopilot(`How can I accelerate my ${goal.name}?`)}
                className="w-full bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Optimize Goal Timeline
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
