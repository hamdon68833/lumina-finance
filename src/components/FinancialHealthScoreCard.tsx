import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Pillar {
  name: string;
  score: number;
  weight: string;
  tip: string;
}

interface FinancialHealthScoreCardProps {
  userContext: { income: number; expenses: number; currentLiquidReserve: number };
}

export const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = ({ userContext }) => {
  const [data, setData] = useState<{ overallScore: number; statusLabel: string; pillars: Pillar[] } | null>(null);

  useEffect(() => {
    fetch('/api/health-score/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userContext)
    })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error('Health score fetch error:', err));
  }, [userContext]);

  if (!data) return null;

  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Lumina Financial Health Score</h2>
            <p className="text-xs text-slate-400">Consolidated score evaluating 7 financial stability pillars</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Overall Health Score</div>
            <div className="text-2xl font-black text-purple-400">{data.overallScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          </div>
        </div>
      </div>

      {/* Pillars Breakdown Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.pillars.map((p, idx) => (
          <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{p.name} ({p.weight})</span>
              <span className="font-bold text-purple-300">{p.score}/100</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${p.score}%` }} />
            </div>
            <p className="text-xs text-slate-400 flex items-start gap-1 pt-1">
              <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              {p.tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
