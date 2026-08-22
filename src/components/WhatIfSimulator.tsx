import React, { useState, useEffect } from 'react';
import { Sliders, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WhatIfSimulatorProps {
  initialMonthlySavings: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ initialMonthlySavings = 1000 }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(initialMonthlySavings);
  const [initialWealth, setInitialWealth] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(11.0);
  const [horizonYears, setHorizonYears] = useState(20);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSimulation = () => {
    setLoading(true);
    fetch('/api/simulator/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyInvestment,
        initialWealth,
        expectedReturnPct: expectedReturn,
        horizonYears
      })
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Simulator fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSimulation();
  }, [monthlyInvestment, initialWealth, expectedReturn, horizonYears]);

  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">What-If Financial Scenario Simulator</h2>
            <p className="text-xs text-slate-400">Interactive multi-horizon wealth projections across Base, Optimistic & Pessimistic returns</p>
          </div>
        </div>
      </div>

      {/* Sliders Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex justify-between">
            <span>Monthly Savings ($)</span>
            <span className="text-emerald-400 font-bold">${monthlyInvestment}</span>
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={monthlyInvestment}
            onChange={e => setMonthlyInvestment(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 flex justify-between">
            <span>Starting Capital ($)</span>
            <span className="text-blue-400 font-bold">${initialWealth}</span>
          </label>
          <input
            type="range"
            min="0"
            max="50000"
            step="500"
            value={initialWealth}
            onChange={e => setInitialWealth(Number(e.target.value))}
            className="w-full mt-2 accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 flex justify-between">
            <span>Expected Return (%)</span>
            <span className="text-purple-400 font-bold">{expectedReturn}%</span>
          </label>
          <input
            type="range"
            min="4"
            max="20"
            step="0.5"
            value={expectedReturn}
            onChange={e => setExpectedReturn(Number(e.target.value))}
            className="w-full mt-2 accent-purple-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 flex justify-between">
            <span>Investment Horizon</span>
            <span className="text-amber-400 font-bold">{horizonYears} Yrs</span>
          </label>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={horizonYears}
            onChange={e => setHorizonYears(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Projection Chart */}
      {data && data.projections && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400">Total Invested</div>
              <div className="text-lg font-bold text-slate-200">${data.finalWealth.totalInvested.toLocaleString()}</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-emerald-400">Base Projected Wealth</div>
              <div className="text-xl font-black text-emerald-300">${data.finalWealth.baseCase.toLocaleString()}</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-purple-400">Optimistic Growth (+3%)</div>
              <div className="text-xl font-black text-purple-300">${data.finalWealth.optimisticCase.toLocaleString()}</div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.projections}>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="baseCase" name="Base Case" stroke="#10B981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="optimisticCase" name="Optimistic" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="pessimisticCase" name="Pessimistic" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="totalInvested" name="Principal Invested" stroke="#64748B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
