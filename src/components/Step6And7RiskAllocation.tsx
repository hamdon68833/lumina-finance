import React from 'react';
import { BrainCircuit, PieChart as PieIcon, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RiskData } from '../types';

interface Step6And7RiskAllocationProps {
  activeStep?: number;
  riskData: RiskData | null;
  onNext: (nextStep?: number) => void;
}

export const Step6And7RiskAllocation: React.FC<Step6And7RiskAllocationProps> = ({
  activeStep = 6,
  riskData,
  onNext,
}) => {
  if (!riskData) {
    return <div className="text-center py-12 text-slate-400">Loading risk classification & portfolio allocation...</div>;
  }

  const getBadgeColor = (cat: string) => {
    if (cat === 'High') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (cat === 'Medium') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  const isStep7 = activeStep === 7;

  if (isStep7) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 07</div>
                <h2 className="text-xl font-semibold tracking-tight text-white">Portfolio Asset Allocation Split</h2>
                <p className="text-zinc-400 text-xs mt-0.5">{riskData.strategyTitle} — {riskData.strategyDescription}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${getBadgeColor(riskData.riskCategory)}`}>
                <span>Strategy:</span>
                <span className="uppercase">{riskData.riskCategory} Risk</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center my-6">
            {/* Recharts Pie Chart */}
            <div className="w-full h-64 bg-[#09090b] rounded-xl border border-white/10 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData.allocations}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="percentage"
                    nameKey="assetClass"
                  >
                    {riskData.allocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, _name: any, item: any) => [
                      `$${(item?.payload?.amount || 0).toFixed(2)} (${Number(value).toFixed(0)}%)`,
                      'Monthly Amount'
                    ]}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#FFF' }}
                  />
                  <Legend formatter={(value) => <span className="text-xs text-zinc-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Table */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Monthly Deployment ($ {riskData.totalInvestable.toLocaleString()}/mo)
              </h4>

              {riskData.allocations.map((item, idx) => (
                <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{item.assetClass}</p>
                      <p className="text-[10px] text-zinc-500">{item.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-zinc-100">${item.amount.toFixed(2)}</p>
                    <p className="text-[10px] font-mono font-semibold text-zinc-400">{item.percentage.toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => onNext(8)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Step 08: Stock Market Insights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Step 6: Risk Classification Engine Card */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 06</div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Rule-Based Quantitative Risk Classifier</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Evaluates User Age, Stated Risk Appetite & Liquid Reserve Buffer with Enforced Safety Guardrails.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${getBadgeColor(riskData.riskCategory)}`}>
              <span>Risk Profile:</span>
              <span className="uppercase">{riskData.riskCategory}</span>
            </div>
            <div className="bg-zinc-900 border border-white/10 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Risk Score</span>
              <span className="text-xs font-mono font-bold text-blue-400">{riskData.riskScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Engine Input Parameters & Evaluated Strategy Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Assessed Strategy</span>
            <span className="text-xs font-semibold text-zinc-100">{riskData.strategyTitle}</span>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Quant Risk Index</span>
            <span className="text-sm font-mono font-bold text-blue-400">{riskData.riskScore} / 100 ({riskData.riskCategory})</span>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Monthly Investable Surplus</span>
            <span className="text-sm font-mono font-bold text-emerald-400">${riskData.totalInvestable.toLocaleString()}/mo</span>
          </div>
        </div>

        {/* Engine Explanations */}
        <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5 mb-6">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Rule-Based Classification Engine Reasoning & Safety Guardrails
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {riskData.explanations.map((exp, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{exp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onNext(7)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Proceed to Step 07: Portfolio Asset Allocation Split</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
