import React, { useState, useEffect } from 'react';
import { CreditCard, Calculator, ArrowRight, Zap, ShieldAlert } from 'lucide-react';

interface DebtAndEMIAnalyzerProps {
  monthlyIncome: number;
}

export const DebtAndEMIAnalyzer: React.FC<DebtAndEMIAnalyzerProps> = ({ monthlyIncome = 6500 }) => {
  const [debts, setDebts] = useState([
    { name: 'Student Education Loan', balance: 12000, interestRate: 7.5, tenureMonths: 48 },
    { name: 'Credit Card Balance', balance: 2500, interestRate: 18.0, tenureMonths: 12 }
  ]);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/debt/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debts, monthlyIncome })
    })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error('Debt API error:', err));
  }, [debts, monthlyIncome]);

  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Debt & EMI Analyzer</h2>
            <p className="text-xs text-slate-400">Debt-to-Income (DTI) audit & Debt Avalanche vs Snowball payoff comparison</p>
          </div>
        </div>

        {data && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-slate-400">Debt-to-Income (DTI) Ratio</div>
            <div className={`text-2xl font-black ${data.dtiRatio > 35 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {data.dtiRatio}% <span className="text-xs font-normal text-slate-400">({data.dtiStatus})</span>
            </div>
          </div>
        )}
      </div>

      {data && data.debts && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.debts.map((d: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-white">
                  <span>{d.name}</span>
                  <span className="text-rose-300 font-bold">${d.monthlyEmi}/mo EMI</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Balance: ${d.balance.toLocaleString()}</span>
                  <span>Rate: {d.interestRate}% APY</span>
                  <span>{d.tenureMonths} mos left</span>
                </div>
              </div>
            ))}
          </div>

          {/* Payoff Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Debt Avalanche Strategy (Optimal Interest Savings)
              </div>
              <p className="text-slate-300">{data.avalancheRecommendation}</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Debt Snowball Strategy (Psychological Momentum)
              </div>
              <p className="text-slate-300">{data.snowballRecommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
