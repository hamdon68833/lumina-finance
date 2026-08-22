import React from 'react';
import { Wallet, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { BudgetData } from '../types';
import { formatINR, formatINRMonthly } from '../utils/formatters';

interface Step4And5SavingsEmergencyProps {
  activeStep?: number;
  budgetData: BudgetData | null;
  onNext: (nextStep?: number) => void;
}

export const Step4And5SavingsEmergency: React.FC<Step4And5SavingsEmergencyProps> = ({
  activeStep = 4,
  budgetData,
  onNext,
}) => {
  if (!budgetData) {
    return <div className="text-center py-12 text-slate-400">Loading budget evaluation...</div>;
  }

  const isCritical = budgetData.statusColor === 'red';
  const isWarning = budgetData.statusColor === 'amber';
  const isStep5 = activeStep === 5;

  if (isStep5) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 05</div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Emergency Reserve Buffer Audit</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Verifies liquid safety buffer before equity/asset deployment.</p>
            </div>
          </div>

          {/* Step 5: Emergency Fund Check Guardrail Banner */}
          <div className={`rounded-2xl p-5 border transition-all mb-6 ${
            isCritical
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
              : isWarning
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 shrink-0 mt-0.5">
                {isCritical ? (
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                ) : isWarning ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold tracking-wider uppercase">
                    STEP 05 DIRECTIVE: RESERVE STATUS — {budgetData.status}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isCritical ? 'bg-rose-500/20 text-rose-300' : isWarning ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {budgetData.monthsCovered.toFixed(1)} / 6.0 Months Target
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-300">{budgetData.advice}</p>
              </div>
            </div>
          </div>

          {/* Reserve overview grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-white/5 mb-6">
            <div className="bg-[#09090b] p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Liquid Reserve</span>
              <span className="text-base font-mono font-bold text-zinc-100">{formatINR(budgetData.currentReserve)}</span>
            </div>
            <div className="bg-[#09090b] p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Target 6-Mo Buffer</span>
              <span className="text-base font-mono font-bold text-zinc-100">{formatINR(budgetData.targetEmergencyFund)}</span>
            </div>
            <div className="bg-[#09090b] p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Reserve Shortfall</span>
              <span className={`text-base font-mono font-bold ${budgetData.emergencyShortfall > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatINR(budgetData.emergencyShortfall)}
              </span>
            </div>
            <div className="bg-[#09090b] p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Coverage Months</span>
              <span className="text-base font-mono font-bold text-blue-400">{budgetData.monthsCovered.toFixed(1)} Months</span>
            </div>
          </div>

          {/* Monthly Emergency Reserve Routing Directive */}
          <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5 mb-6">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Monthly Emergency Reserve Routing Directive
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Emergency Reserve Top-Up</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{formatINRMonthly(budgetData.emergencyMonthlyAllocation)}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {budgetData.emergencyMonthlyAllocation > 0
                    ? 'Mandatory priority allocation to build minimum 3-6 month safety buffer.'
                    : 'Emergency reserve is fully funded! 0% needed.'}
                </p>
              </div>

              <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Net Investable Surplus</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{formatINRMonthly(budgetData.investableMonthlySavings)}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Deployable into Stocks, Mutual Funds, Gold, and Fixed Deposits in Step 07.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => onNext(6)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Step 06: AI Risk Classification Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step 4: Savings Calculation Header Card */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/5">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 04</div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Savings Engine Analysis</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Savings = Income − Expenses. Calculates net investable surplus from income and expense data.</p>
          </div>
        </div>

        {/* 4 Metric Cards - Compact High-Density Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Monthly Income</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500/80 shrink-0" />
            </div>
            <p className="text-lg font-mono font-bold text-zinc-100 tracking-tight">{formatINR(budgetData.monthlyIncome)}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Total revenue input</p>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Expenses</span>
              <span className="w-2 h-2 rounded-full bg-rose-500/80 shrink-0" />
            </div>
            <p className="text-lg font-mono font-bold text-rose-400 tracking-tight">{formatINR(budgetData.totalExpenses)}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Categorized costs</p>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Net Monthly Savings</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${budgetData.monthlySavings >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {budgetData.savingsRatio.toFixed(1)}% Rate
              </span>
            </div>
            <p className={`text-lg font-mono font-bold tracking-tight ${budgetData.monthlySavings >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {formatINR(budgetData.monthlySavings)}
            </p>
            <p className="text-[10px] font-mono text-emerald-400 mt-0.5 font-semibold">{budgetData.savingsRatio.toFixed(1)}% Savings Rate</p>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Reserve Coverage</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold">Target 3–6M</span>
            </div>
            <p className="text-lg font-mono font-bold text-blue-400 tracking-tight">{budgetData.monthsCovered.toFixed(1)} Months</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Target: 3 to 6 Months</p>
          </div>
        </div>

        {/* Monthly Cashflow Routing Diagram */}
        <div className="mt-6 bg-zinc-900/50 rounded-xl p-5 border border-white/5">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Monthly Savings Cashflow Distribution Strategy (${budgetData.monthlySavings.toLocaleString()}/mo)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">Emergency Reserve Top-Up</span>
                <span className="text-sm font-mono font-bold text-amber-400">${budgetData.emergencyMonthlyAllocation.toFixed(2)}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${budgetData.monthlySavings > 0 ? (budgetData.emergencyMonthlyAllocation / budgetData.monthlySavings) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                {budgetData.emergencyMonthlyAllocation > 0
                  ? 'Mandatory priority allocation to build minimum 3-6 month safety buffer.'
                  : 'Emergency reserve is fully funded! 0% needed.'}
              </p>
            </div>

            <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">Net Investable Surplus</span>
                <span className="text-sm font-mono font-bold text-emerald-400">${budgetData.investableMonthlySavings.toFixed(2)}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${budgetData.monthlySavings > 0 ? (budgetData.investableMonthlySavings / budgetData.monthlySavings) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Deployable into Stocks, Mutual Funds, Gold, and Fixed Deposits in Step 07.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onNext(5)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Proceed to Step 05: Emergency Buffer Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
