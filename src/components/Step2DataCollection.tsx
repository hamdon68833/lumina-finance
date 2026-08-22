import React from 'react';
import { User, DollarSign, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

interface Step2DataCollectionProps {
  income: number;
  setIncome: (val: number) => void;
  age: number;
  setAge: (val: number) => void;
  riskPreference: string;
  setRiskPreference: (val: string) => void;
  currentReserve: number;
  setCurrentReserve: (val: number) => void;
  onNext: () => void;
}

export const Step2DataCollection: React.FC<Step2DataCollectionProps> = ({
  income,
  setIncome,
  age,
  setAge,
  riskPreference,
  setRiskPreference,
  currentReserve,
  setCurrentReserve,
  onNext,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Step Info Card */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/5">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 02</div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Personal & Financial Profile Inputs</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Capture baseline income, user age, stated risk appetite, and existing liquid emergency reserves.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          
          {/* Monthly Income */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="uppercase text-[11px] tracking-wider text-zinc-400">Monthly Income ($ / ₹)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-mono text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="100"
                value={income === 0 ? '' : income}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, '');
                  setIncome(raw === '' ? 0 : parseFloat(raw));
                }}
                className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2 pl-8 pr-3 text-base font-mono font-bold text-emerald-400 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Total take-home salary or monthly revenue after taxes.</p>
          </div>

          {/* User Age */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="uppercase text-[11px] tracking-wider text-zinc-400">User Age (Years)</span>
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={age === 0 ? '' : age}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const raw = e.target.value.replace(/^0+(?=\d)/, '');
                setAge(raw === '' ? 0 : parseInt(raw, 10));
              }}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2 px-3 text-base font-mono font-bold text-blue-400 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Age determines investment time horizon & equity risk capacity.</p>
          </div>

          {/* Stated Risk Preference */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="uppercase text-[11px] tracking-wider text-zinc-400">Stated Risk Preference</span>
            </label>
            <select
              value={riskPreference}
              onChange={(e) => setRiskPreference(e.target.value)}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2.5 px-3 text-sm font-semibold text-white focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="High">High Risk (Aggressive Growth)</option>
              <option value="Medium">Medium Risk (Balanced Portfolio)</option>
              <option value="Low">Low Risk (Capital Preservation)</option>
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">Your personal risk willingness before automated ML evaluation.</p>
          </div>

          {/* Existing Liquid Reserve */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="uppercase text-[11px] tracking-wider text-zinc-400">Existing Reserve Buffer ($ / ₹)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-mono text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="500"
                value={currentReserve === 0 ? '' : currentReserve}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, '');
                  setCurrentReserve(raw === '' ? 0 : parseFloat(raw));
                }}
                className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2 pl-8 pr-3 text-base font-mono font-bold text-purple-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Current liquid savings in savings account / liquid debt fund.</p>
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Proceed to Step 03: Expense Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
