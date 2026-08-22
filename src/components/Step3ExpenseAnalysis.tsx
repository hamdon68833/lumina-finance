import React from 'react';
import { Receipt, Home, ShoppingBag, Car, HeartPulse, Film, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface Step3ExpenseAnalysisProps {
  expenses: {
    housing_utilities: number;
    food_groceries: number;
    transportation: number;
    healthcare: number;
    entertainment_misc: number;
  };
  setExpenses: React.Dispatch<React.SetStateAction<{
    housing_utilities: number;
    food_groceries: number;
    transportation: number;
    healthcare: number;
    entertainment_misc: number;
  }>>;
  onNext: () => void;
}

export const Step3ExpenseAnalysis: React.FC<Step3ExpenseAnalysisProps> = ({
  expenses,
  setExpenses,
  onNext,
}) => {
  const handleChange = (key: keyof typeof expenses, rawVal: string) => {
    const clean = rawVal.replace(/^0+(?=\d)/, '');
    const val = clean === '' ? 0 : parseFloat(clean);
    setExpenses((prev) => ({ ...prev, [key]: Math.max(0, isNaN(val) ? 0 : val) }));
  };

  const totalExpenses = (Object.values(expenses) as number[]).reduce((a, b) => a + b, 0);

  const categories = [
    { key: 'housing_utilities', label: 'Housing & Rent / Utilities', icon: Home, color: 'text-blue-400', val: expenses.housing_utilities },
    { key: 'food_groceries', label: 'Food & Groceries', icon: ShoppingBag, color: 'text-emerald-400', val: expenses.food_groceries },
    { key: 'transportation', label: 'Transport & Fuel / Commute', icon: Car, color: 'text-amber-400', val: expenses.transportation },
    { key: 'healthcare', label: 'Healthcare & Medical Insurance', icon: HeartPulse, color: 'text-rose-400', val: expenses.healthcare },
    { key: 'entertainment_misc', label: 'Entertainment & Subscriptions', icon: Film, color: 'text-purple-400', val: expenses.entertainment_misc },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 03</div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Expense Analysis & Categorization</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Break down monthly expenditure to evaluate real net savings capacity.</p>
            </div>
          </div>

          <div className="text-right bg-zinc-900/80 border border-white/10 px-4 py-2 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-wider">Total Expenditure</span>
            <span className="text-xl font-mono font-bold text-rose-400">{formatINR(totalExpenses)}</span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-3.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const pct = totalExpenses > 0 ? (cat.val / totalExpenses) * 100 : 0;

            return (
              <div key={cat.key} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <div className={`w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{cat.label}</p>
                    <p className="text-[11px] font-mono text-zinc-500">{pct.toFixed(1)}% of total expenses</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-zinc-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={cat.val === 0 ? '' : cat.val}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleChange(cat.key as any, e.target.value)}
                      className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm font-mono font-bold text-white text-left focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Proceed to Step 04 & 05: Savings Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
