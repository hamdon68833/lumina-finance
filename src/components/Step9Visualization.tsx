import React from 'react';
import { BarChart3, PieChart as PieIcon, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BudgetData, RiskData, StockData } from '../types';

interface Step9VisualizationProps {
  budgetData: BudgetData | null;
  riskData: RiskData | null;
  selectedStock: StockData | null;
  onNext: () => void;
}

export const Step9Visualization: React.FC<Step9VisualizationProps> = ({
  budgetData,
  riskData,
  selectedStock,
  onNext,
}) => {
  if (!budgetData || !riskData) {
    return <div className="text-center py-12 text-slate-400">Loading master visualization dashboard...</div>;
  }

  const EXPENSE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

  const cashflowData = [
    { name: 'Income', amount: budgetData.monthlyIncome, fill: '#3B82F6' },
    { name: 'Expenses', amount: budgetData.totalExpenses, fill: '#F43F5E' },
    { name: 'Savings', amount: budgetData.monthlySavings, fill: '#10B981' },
    { name: 'Emergency Topup', amount: budgetData.emergencyMonthlyAllocation, fill: '#F59E0B' },
    { name: 'Investable', amount: budgetData.investableMonthlySavings, fill: '#8B5CF6' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/5">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 09</div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Interactive Master Visualization Dashboard</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Unified financial analytics combining budget structure, risk score, asset allocation & stock insights.</p>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Monthly Net Savings</span>
            <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">${budgetData.monthlySavings.toLocaleString()}</p>
            <span className="text-[11px] text-zinc-500">{budgetData.savingsRatio.toFixed(1)}% of total income</span>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Emergency Buffer</span>
            <p className="text-2xl font-mono font-bold text-blue-400 mt-1">{budgetData.monthsCovered.toFixed(1)} Months</p>
            <span className="text-[11px] text-zinc-500">${budgetData.currentReserve.toLocaleString()} liquid cash</span>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Risk Profile</span>
            <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{riskData.riskCategory}</p>
            <span className="text-[11px] text-zinc-500">Score: {riskData.riskScore}/100</span>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Investable Surplus</span>
            <p className="text-2xl font-mono font-bold text-purple-400 mt-1">${budgetData.investableMonthlySavings.toLocaleString()}</p>
            <span className="text-[11px] text-zinc-500">Deployed per risk split</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Chart 1: Expense Breakdown Donut */}
          <div className="bg-[#09090b] border border-white/10 rounded-2xl p-5">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Monthly Expense Allocation Breakdown
            </h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {budgetData.expenseBreakdown.map((entry, idx) => (
                      <Cell key={`exp-${idx}`} fill={EXPENSE_COLORS[idx % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#FFF' }} />
                  <Legend formatter={(val) => <span className="text-xs text-zinc-300">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Portfolio Asset Allocation Split */}
          <div className="bg-[#09090b] border border-white/10 rounded-2xl p-5">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Portfolio Asset Class Distribution ({riskData.riskCategory} Risk)
            </h4>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData.allocations}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="percentage"
                    nameKey="assetClass"
                  >
                    {riskData.allocations.map((entry, idx) => (
                      <Cell key={`alloc-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, _name: any, item: any) => [
                      `$${(item?.payload?.amount || 0).toFixed(2)} (${Number(value).toFixed(0)}%)`,
                      'Allocation'
                    ]}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#FFF' }} 
                  />
                  <Legend formatter={(val) => <span className="text-xs text-zinc-300">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Chart 3: Cashflow Waterfall Stream */}
        <div className="bg-[#09090b] border border-white/10 rounded-2xl p-5">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Monthly Cashflow Pipeline Breakdown ($)
          </h4>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {cashflowData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Proceed to Step 10: Final AI Strategy Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
