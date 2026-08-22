import React from 'react';
import { Activity, ShieldCheck, DollarSign, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { FinancialTwinScore } from '../types';

interface FinancialTwinDashboardProps {
  twin: FinancialTwinScore;
}

export const FinancialTwinDashboard: React.FC<FinancialTwinDashboardProps> = ({ twin }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Financial Digital Twin</h2>
          </div>
          <p className="text-sm text-slate-400">Live mathematical model representing your financial health, risk capacity, and liquidity safety.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-850 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-xs font-medium text-slate-400">Overall Digital Twin Index</span>
          <span className={`text-2xl font-black ${twin.overallHealth >= 75 ? 'text-emerald-400' : twin.overallHealth >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {twin.overallHealth} / 100
          </span>
        </div>
      </div>

      {/* 5 Core Twin Dimension Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Financial Stability</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{twin.stabilityScore}</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${twin.stabilityScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Liquidity Safety</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{twin.liquidityScore}</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${twin.liquidityScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Debt Pressure Index</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{twin.debtPressureScore}</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${twin.debtPressureScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Investment Readiness</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{twin.investmentReadinessScore}</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${twin.investmentReadinessScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Goal Readiness</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{twin.goalReadinessScore}</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${twin.goalReadinessScore}%` }} />
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-950/20 border border-emerald-800/50 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">Core Financial Strengths</h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {twin.strengths.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-950/20 border border-rose-800/50 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-rose-400 mb-2">Areas For Optimization</h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {twin.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
