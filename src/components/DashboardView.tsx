import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Wallet,
  PieChart,
  Target,
  Sparkles,
  Activity,
  Zap,
  FileText
} from 'lucide-react';
import { MainHubType } from './Sidebar';
import { formatINR, formatINRMonthly } from '../utils/formatters';
import { NextBestActionBanner } from './NextBestActionBanner';

interface DashboardViewProps {
  userContext: any;
  onNavigate: (hub: MainHubType) => void;
  onOpenCopilot: (prompt?: string) => void;
  onOpenDocumentUpload: () => void;
  unreadAlertCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userContext,
  onNavigate,
  onOpenCopilot,
  onOpenDocumentUpload,
  unreadAlertCount
}) => {
  const hasData = Boolean(userContext?.income > 0 || userContext?.expenses > 0 || userContext?.isDemoMode);
  const income = hasData ? (userContext.income || 65000) : null;
  const expenses = hasData ? (userContext.expenses || 38000) : null;
  const savings = (income !== null && expenses !== null) ? Math.max(0, income - expenses) : null;
  const reserve = hasData ? (userContext.currentLiquidReserve || 180000) : null;
  const reserveMonths = (reserve !== null && expenses && expenses > 0) ? (reserve / expenses).toFixed(1) : "0.0";

  // Financial Health Score Calculation (Deterministic)
  const savingsRatio = (income && savings) ? Math.min(100, Math.max(0, (savings / income) * 100)) : 0;
  const reserveScore = reserveMonths ? Math.min(100, (parseFloat(reserveMonths) / 6.0) * 100) : 0;
  const healthScore = hasData ? Math.round((savingsRatio * 0.4) + (reserveScore * 0.6)) : 0;

  const healthStatus = !hasData ? 'Data unavailable' : (healthScore >= 75 ? 'Healthy' : healthScore >= 50 ? 'Moderate' : 'Needs Attention');

  // Dynamic AI Insight based on actual metrics
  let aiHeroInsight = "Your monthly cash flow is positive, but your emergency reserve is slightly below the 6-month safety baseline.";
  if (parseFloat(reserveMonths) < 3.0) {
    aiHeroInsight = "Urgent: Emergency coverage is below 3 months. Prioritize building liquid cash reserves before allocating funds to equities.";
  } else if (savingsRatio > 30 && parseFloat(reserveMonths) >= 6.0) {
    aiHeroInsight = "Excellent financial posture! Emergency reserve is fully funded. You have surplus cash flow ready for investment optimization.";
  }

  // Attention Priorities (Top 1-3)
  const attentionItems = [];
  if (parseFloat(reserveMonths) < 6.0) {
    attentionItems.push({
      title: 'Emergency Reserve Gap',
      desc: `Your liquid buffer covers ${reserveMonths} months of essential expenses (Target: 6.0 months).`,
      actionLabel: 'Improve Reserve',
      action: () => onNavigate('money'),
      icon: ShieldCheck,
      color: 'amber'
    });
  }

  attentionItems.push({
    title: 'House Goal Contribution',
    desc: `You are currently ${formatINRMonthly(3600)} behind your accelerated target downpayment timeline.`,
    actionLabel: 'Optimize Goal',
    action: () => onNavigate('goals'),
    icon: Target,
    color: 'blue'
  });

  if (unreadAlertCount > 0) {
    attentionItems.push({
      title: 'Portfolio Allocation Alert',
      desc: 'High concentration in technology equities detected. Review portfolio diversification.',
      actionLabel: 'Analyze Risk',
      action: () => onNavigate('alerts'),
      icon: AlertTriangle,
      color: 'rose'
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HERO COMMAND SECTION — Intentionally Dark Gradient */}
      <section className="hero-section bg-gradient-to-br from-[#0f172a] via-[#09090b] to-[#1e1b4b] border border-slate-700/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/30">
                AI FINANCIAL COMMAND CENTER
              </span>
              <span className="text-xs text-slate-300 font-mono">• Live Context</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              WELCOME BACK, <span className="text-blue-400">HAMDAN</span>
            </h1>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {aiHeroInsight}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenCopilot('How am I doing financially today?')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/40 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Ask Lumina Advisory
              </button>
              <button
                onClick={onOpenDocumentUpload}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                Upload Financial Statement
              </button>
            </div>
          </div>

          {/* Financial Health Dial Card inside Hero */}
          <div className="bg-slate-900/90 dark:bg-zinc-900/90 border border-slate-700/80 dark:border-white/10 rounded-2xl p-5 shrink-0 flex items-center gap-5 shadow-inner text-white">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 - (238.7 * healthScore) / 100}
                  className="text-emerald-400 transition-all duration-1000"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white block leading-none">{healthScore}</span>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">/ 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Financial Health</span>
              <span className="text-base font-extrabold text-emerald-400 block">{healthStatus}</span>
              <span className="text-[11px] text-slate-300 block">Savings: {savingsRatio.toFixed(0)}% • Reserve: {reserveMonths}m</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5. NEXT BEST ACTION BANNER (Financial Safety Order Priority) */}
      <NextBestActionBanner userContext={userContext} onActionClick={onNavigate} />

      {/* 2. COMPACT FINANCIAL SNAPSHOT (4-COLUMN GRID) — Pure White in Light Mode */}
      <section className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Financial Snapshot</h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-4 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-xs font-semibold">Monthly Income</span>
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatINR(income)}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Verified Profile Input
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-4 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-xs font-semibold">Monthly Expenses</span>
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatINR(expenses)}</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
              <Activity className="w-3 h-3" /> {((expenses / income) * 100).toFixed(0)}% of Monthly Income
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-4 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-xs font-semibold">Monthly Net Savings</span>
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(savings)}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Net Positive Cash Flow
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-4 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-xs font-semibold">Emergency Fund</span>
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{reserveMonths} <span className="text-xs text-slate-500 dark:text-zinc-400">Months</span></div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
              Target Baseline: 6.0 Months
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT NEEDS YOUR ATTENTION? — Pure White Cards in Light Mode */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">What Needs Your Attention?</h3>
          <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">1–3 Priority Action Items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {attentionItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-4 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>

                <button
                  onClick={item.action}
                  className="w-full bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {item.actionLabel}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. NEXT BEST ACTION & FINANCIAL STATE / DIGITAL TWIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Best Action Card */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/40 dark:via-zinc-900 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-500/30 p-5 rounded-2xl space-y-4 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider">NEXT BEST ACTION</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              +12 Health Points
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Increase Emergency Savings Buffer to 6 Months</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Why: Your liquid reserve currently covers {reserveMonths} months of essential expenses. Reaching 6.0 months provides full protection against cash flow disruptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('money')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              See Savings Plan
            </button>
            <button
              onClick={() => onOpenCopilot('How can I reach my 6-month emergency reserve faster?')}
              className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              Ask Lumina
            </button>
          </div>
        </div>

        {/* Financial State / Digital Twin System */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-zinc-400">Financial Digital Twin</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Calculated</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Liquidity Coverage', score: Math.round(parseFloat(reserveMonths) * 16.6) },
              { label: 'Cash Flow Stability', score: Math.round(savingsRatio) },
              { label: 'Debt Pressure', score: 85 },
              { label: 'Investment Readiness', score: 70 },
              { label: 'Goal Alignment', score: 64 }
            ].map((state, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-700 dark:text-zinc-300">{state.label}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{state.score}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, state.score)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. QUICK ACTIONS ROW */}
      <section className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Quick Actions</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Analyze Spending', action: () => onNavigate('money'), icon: Wallet },
            { label: 'Check Risk', action: () => onNavigate('investments'), icon: PieChart },
            { label: 'Optimize Goal', action: () => onNavigate('goals'), icon: Target },
            { label: 'Market Overview', action: () => onNavigate('market'), icon: TrendingUp },
            { label: 'Upload Statement', action: onOpenDocumentUpload, icon: FileText },
            { label: 'Ask Lumina', action: () => onOpenCopilot(), icon: Sparkles, highlight: true }
          ].map((qa, i) => {
            const Icon = qa.icon;
            return (
              <button
                key={i}
                onClick={qa.action}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-2 ${
                  qa.highlight
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                    : 'bg-white dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{qa.label}</span>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
};
