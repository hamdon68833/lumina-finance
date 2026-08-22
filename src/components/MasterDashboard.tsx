import React, { useState } from 'react';
import { FinancialTwinDashboard } from './FinancialTwinDashboard';
import { MarketAlertPanel } from './MarketAlertPanel';
import { FinancialTwinScore, HealthScore2Result } from '../types';
import { Activity, ShieldCheck, Target, TrendingUp, AlertTriangle, Lightbulb, CheckSquare, Eye, RefreshCw } from 'lucide-react';
import { PortfolioStressEngine } from '../../portfolio_intelligence';
import { ActionPlanEngine } from '../../action_plan_engine';
import { InsightEngine } from '../../insight_engine';

interface MasterDashboardProps {
  userContext: any;
  twin: FinancialTwinScore;
  healthScore: HealthScore2Result;
  alerts: any[];
  onOpenCopilot: (query?: string) => void;
  onOpenAlertAction: (alert: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  userContext,
  twin,
  healthScore,
  alerts,
  onOpenCopilot,
  onOpenAlertAction
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEALTH' | 'STRESS_TEST' | 'INSIGHTS' | 'ACTION_PLAN'>('OVERVIEW');
  const stressTest = PortfolioStressEngine.runStressTest(-20, userContext);
  const actionPlan = ActionPlanEngine.generateActionPlan(userContext);
  const insights = InsightEngine.generateInsights(userContext);

  return (
    <div className="space-y-6">
      {/* Top Banner Proactive Alert Overview */}
      <MarketAlertPanel alerts={alerts} onOpenAction={onOpenAlertAction} />

      {/* Digital Twin 5 Gauge Dashboard */}
      <FinancialTwinDashboard twin={twin} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'OVERVIEW' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-850 text-slate-400 hover:text-slate-200'}`}
        >
          Master Overview
        </button>
        <button
          onClick={() => setActiveTab('HEALTH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'HEALTH' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-850 text-slate-400 hover:text-slate-200'}`}
        >
          Financial Health 2.0
        </button>
        <button
          onClick={() => setActiveTab('STRESS_TEST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'STRESS_TEST' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-850 text-slate-400 hover:text-slate-200'}`}
        >
          Portfolio Stress Test
        </button>
        <button
          onClick={() => setActiveTab('INSIGHTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'INSIGHTS' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-850 text-slate-400 hover:text-slate-200'}`}
        >
          AI Proactive Insights
        </button>
        <button
          onClick={() => setActiveTab('ACTION_PLAN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'ACTION_PLAN' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-850 text-slate-400 hover:text-slate-200'}`}
        >
          Personalized Action Plan
        </button>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Overall Health 2.0
            </h3>
            <div className="text-3xl font-black text-emerald-400">{healthScore.overallScore} / 100</div>
            <p className="text-xs text-slate-400">Rating: <strong className="text-white">{healthScore.rating}</strong></p>
            <p className="text-xs text-slate-400">Strongest Driver: <strong className="text-emerald-400">{healthScore.strongestDriver}</strong></p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Stress Test Resilience
            </h3>
            <div className="text-xl font-bold text-slate-100">{stressTest.crashScenario}</div>
            <p className="text-xs text-slate-400">Drawdown Impact: <strong className="text-rose-400">-₹{stressTest.drawdownAmount.toLocaleString()}</strong></p>
            <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">SIMULATION ONLY</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" /> Priority Today Action
            </h3>
            <p className="text-xs text-slate-300">{actionPlan.today[0]}</p>
            <button
              onClick={() => onOpenCopilot("Analyze my top financial priorities for today")}
              className="w-full bg-slate-800 hover:bg-slate-750 text-cyan-400 text-xs font-bold py-2 rounded-xl transition border border-slate-700"
            >
              Ask Lumina Copilot
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: HEALTH 2.0 */}
      {activeTab === 'HEALTH' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white">Financial Health Score 2.0 Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthScore.components.map(c => (
              <div key={c.name} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="font-mono font-bold text-emerald-400">{c.score}/100</span>
                </div>
                <p className="text-xs text-slate-400">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: STRESS TEST */}
      {activeTab === 'STRESS_TEST' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Portfolio Stress Test (-20% Equity Crash)</h3>
            <span className="text-xs font-mono bg-rose-950 text-rose-400 border border-rose-800 px-2 py-1 rounded">SIMULATION</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Baseline Value</span>
              <div className="text-lg font-bold text-white">₹{stressTest.baselinePortfolioValue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Post-Crash Value</span>
              <div className="text-lg font-bold text-rose-400">₹{stressTest.postCrashPortfolioValue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Est. Recovery Horizon</span>
              <div className="text-lg font-bold text-amber-400">{stressTest.estimatedRecoveryMonths} Months</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: INSIGHTS */}
      {activeTab === 'INSIGHTS' && (
        <div className="space-y-4">
          {insights.map(i => (
            <div key={i.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">{i.title}</span>
                <span className="text-[10px] font-mono text-slate-500">{i.source}</span>
              </div>
              <p className="text-xs text-slate-300">{i.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: ACTION PLAN */}
      {activeTab === 'ACTION_PLAN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Today</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {actionPlan.today.map((act, idx) => <li key={idx}>• {act}</li>)}
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">This Week</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {actionPlan.thisWeek.map((act, idx) => <li key={idx}>• {act}</li>)}
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">This Month</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {actionPlan.thisMonth.map((act, idx) => <li key={idx}>• {act}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
