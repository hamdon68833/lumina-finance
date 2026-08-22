import React, { useState } from 'react';
import { Wallet, ShieldCheck, CreditCard, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatINR, formatINRMonthly } from '../utils/formatters';

interface MoneyHubViewProps {
  userContext: any;
  onOpenCopilot: (prompt?: string) => void;
}

export const MoneyHubView: React.FC<MoneyHubViewProps> = ({ userContext, onOpenCopilot }) => {
  const [activeTab, setActiveTab] = useState<'cashflow' | 'expenses' | 'emergency' | 'debt'>('cashflow');

  const hasData = Boolean(userContext?.income > 0 || userContext?.expenses > 0 || userContext?.isDemoMode);
  const income = hasData ? (userContext.income || 65000) : null;
  const expenses = hasData ? (userContext.expenses || 38000) : null;
  const savings = (income !== null && expenses !== null) ? Math.max(0, income - expenses) : null;
  const reserve = hasData ? (userContext.currentLiquidReserve || 180000) : null;
  const monthlyExpenses = expenses || 0;
  const reserveMonths = (reserve !== null && monthlyExpenses > 0) ? (reserve / monthlyExpenses).toFixed(1) : "0.0";
  const emi = userContext.monthlyDebtPayments || 0;
  const dti = (income && income > 0) ? ((emi / income) * 100).toFixed(1) : "0.0";

  const expenseBreakdown = [
    { label: 'Housing & Utilities', amount: Math.round(expenses * 0.35), pct: 35 },
    { label: 'Food & Groceries', amount: Math.round(expenses * 0.25), pct: 25 },
    { label: 'Transportation', amount: Math.round(expenses * 0.15), pct: 15 },
    { label: 'Healthcare & Insurance', amount: Math.round(expenses * 0.10), pct: 10 },
    { label: 'Entertainment & Misc', amount: Math.round(expenses * 0.15), pct: 15 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Money & Cash Flow Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Unified Management for Income, Expenses, Savings Reserve & Debt</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-1 rounded-2xl">
          {[
            { id: 'cashflow', label: 'Cash Flow' },
            { id: 'expenses', label: 'Expenses' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'debt', label: 'Debt & EMI' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white dark:bg-blue-600/20 dark:text-blue-400 dark:border dark:border-blue-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Cash Flow Overview */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold block">Total Monthly Income</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(income)}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">100% Cash Flow Base</span>
            </div>

            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold block">Total Monthly Expenses</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{formatINR(expenses)}</div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">{((expenses / income) * 100).toFixed(0)}% Outflow</span>
            </div>

            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold block">Net Monthly Savings</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(savings)}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{((savings / income) * 100).toFixed(0)}% Savings Rate</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cash Flow Breakdown</span>
              <button
                onClick={() => onOpenCopilot('How can I optimize my monthly cash flow and expenses?')}
                className="text-xs text-amber-600 dark:text-amber-300 hover:underline flex items-center gap-1 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask Lumina Optimization
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  <span>Expenses Outflow ({formatINR(expenses)})</span>
                  <span>{((expenses / income) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(expenses / income) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  <span>Net Savings Retention ({formatINR(savings)})</span>
                  <span>{((savings / income) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(savings / income) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Monthly Expense Categorization</span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">Total: {formatINR(expenses)}</span>
          </div>

          <div className="space-y-3">
            {expenseBreakdown.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span>{item.label}</span>
                  <span>{formatINR(item.amount)} ({item.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Emergency Reserve */}
      {activeTab === 'emergency' && (
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Emergency Reserve Safety Analysis</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Coverage: {reserveMonths} Months</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-slate-500 dark:text-zinc-400 font-semibold block">Current Reserve Fund</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatINR(reserve)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-slate-500 dark:text-zinc-400 font-semibold block">6-Month Target Reserve</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(monthlyExpenses * 6)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Debt & EMI */}
      {activeTab === 'debt' && (
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Debt & Loan Payoff Analysis</span>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">DTI Ratio: {dti}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-slate-500 dark:text-zinc-400 font-semibold block">Monthly EMI Commitment</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatINRMonthly(emi)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-slate-500 dark:text-zinc-400 font-semibold block">Recommended Strategy</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block">Debt Avalanche (High Interest First)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
