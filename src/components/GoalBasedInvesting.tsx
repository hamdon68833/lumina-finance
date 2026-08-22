import React, { useState } from 'react';
import { Target, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  monthsLeft: number;
  requiredMonthly: number;
  status: 'ON_TRACK' | 'NEEDS_ADJUSTMENT' | 'AT_RISK';
}

export const GoalBasedInvesting: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', name: 'House Downpayment', targetAmount: 50000, currentSavings: 14000, monthsLeft: 36, requiredMonthly: 980, status: 'ON_TRACK' },
    { id: '2', name: 'Emergency Safety Reserve', targetAmount: 18000, currentSavings: 8000, monthsLeft: 12, requiredMonthly: 810, status: 'NEEDS_ADJUSTMENT' },
    { id: '3', name: 'Master Degree / Education', targetAmount: 25000, currentSavings: 4000, monthsLeft: 24, requiredMonthly: 840, status: 'ON_TRACK' }
  ]);

  const [newGoalName, setNewGoalName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newMonths, setNewMonths] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName || !newTarget) return;

    const target = parseFloat(newTarget) || 10000;
    const months = parseInt(newMonths) || 24;
    const req = Math.round(target / months);

    const created: Goal = {
      id: String(Date.now()),
      name: newGoalName,
      targetAmount: target,
      currentSavings: 0,
      monthsLeft: months,
      requiredMonthly: req,
      status: 'ON_TRACK'
    };

    setGoals([...goals, created]);
    setNewGoalName('');
    setNewTarget('');
    setNewMonths('');
  };

  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Goal-Based Wealth Planning</h2>
            <p className="text-xs text-slate-400">Track target milestones, required monthly savings & status indicators</p>
          </div>
        </div>
      </div>

      {/* Goal Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map(g => (
          <div key={g.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{g.name}</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${g.status === 'ON_TRACK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : g.status === 'NEEDS_ADJUSTMENT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {g.status === 'ON_TRACK' ? '🟢 ON TRACK' : g.status === 'NEEDS_ADJUSTMENT' ? '🟡 ADJUST' : '🔴 AT RISK'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress (${g.currentSavings.toLocaleString()} / ${g.targetAmount.toLocaleString()})</span>
                <span>{Math.round((g.currentSavings / g.targetAmount) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (g.currentSavings / g.targetAmount) * 100)}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {g.monthsLeft} months left
              </div>
              <div className="text-amber-300 font-bold">
                ${g.requiredMonthly}/mo req.
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Goal Form */}
      <form onSubmit={handleAddGoal} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="New Goal Name (e.g. Retirement, Car)"
          value={newGoalName}
          onChange={e => setNewGoalName(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 flex-1 w-full"
        />
        <input
          type="number"
          placeholder="Target ($)"
          value={newTarget}
          onChange={e => setNewTarget(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 w-full sm:w-32"
        />
        <input
          type="number"
          placeholder="Months"
          value={newMonths}
          onChange={e => setNewMonths(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 w-full sm:w-24"
        />
        <button type="submit" className="bg-amber-500 text-black font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-amber-400 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </form>
    </div>
  );
};
