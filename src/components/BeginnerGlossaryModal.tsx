import React, { useState } from 'react';
import { X, BookOpen, Search, HelpCircle, ArrowRight } from 'lucide-react';

interface BeginnerGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOSSARY_ITEMS = [
  {
    term: 'RSI (Relative Strength Index)',
    category: 'Technical Indicator',
    definition: 'A momentum indicator that helps show whether a stock has recently been bought or sold heavily.',
    example: 'An RSI above 70 indicates overbought conditions (price has risen fast), while below 30 indicates oversold conditions.',
    beginnerTip: 'Do not buy or sell based on RSI alone; evaluate company fundamentals and your portfolio concentration first.'
  },
  {
    term: 'SMA (Simple Moving Average)',
    category: 'Technical Indicator',
    definition: 'An average price over a selected period used to understand the general price trend.',
    example: 'A 50-day SMA shows the average closing price over the last 50 trading days.',
    beginnerTip: 'When current price is above the moving average, it generally signals an upward trend.'
  },
  {
    term: 'Diversification',
    category: 'Portfolio Management',
    definition: 'Spreading investments across different assets so one investment does not have too much impact on your total portfolio.',
    example: 'Investing across Equities, Mutual Funds, Gold, and Fixed Income rather than putting 100% into one company.',
    beginnerTip: 'Diversification protects you against company-specific crashes while letting you participate in market growth.'
  },
  {
    term: 'Volatility',
    category: 'Risk & Market',
    definition: "How much an investment's price tends to move up and down over time.",
    example: 'Individual tech stocks generally have higher volatility than government bonds or diversified index funds.',
    beginnerTip: 'High volatility brings higher short-term ups and downs; longer investment horizons smooth out volatility.'
  },
  {
    term: 'Sharpe Ratio',
    category: 'Risk & Return',
    definition: 'A measure of return relative to the amount of risk taken.',
    example: 'A Sharpe ratio above 1.0 indicates that a portfolio generates good returns for every unit of risk.',
    beginnerTip: 'Higher Sharpe ratio is better because it means higher risk-adjusted efficiency.'
  },
  {
    term: 'DTI (Debt-to-Income Ratio)',
    category: 'Personal Finance',
    definition: 'The percentage of your monthly income being used to repay debt obligations (EMIs).',
    example: 'If your income is ₹65,000 and total loan EMIs are ₹13,000, your DTI ratio is 20%.',
    beginnerTip: 'Keep your DTI below 30% to maintain healthy cash flow for emergency reserves and investing.'
  },
  {
    term: 'Emergency Reserve',
    category: 'Financial Foundation',
    definition: 'Liquid savings kept in high-safety accounts to cover 6 months of essential living expenses.',
    example: 'If your essential expenses are ₹38,000/month, your target emergency fund is ₹2,28,000.',
    beginnerTip: 'Always fund your 6-month emergency reserve BEFORE taking aggressive stock market risk.'
  },
  {
    term: 'Concentration Risk',
    category: 'Portfolio Management',
    definition: 'When a single stock or asset represents more than 15-20% of your portfolio, exposing you to severe loss.',
    example: 'Holding 66.7% of your portfolio in NVIDIA means your net worth swings heavily on one company.',
    beginnerTip: 'Rebalance high concentration positions into broader mutual funds or index funds over time.'
  }
];

export const BeginnerGlossaryModal: React.FC<BeginnerGlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', ...Array.from(new Set(GLOSSARY_ITEMS.map(item => item.category)))];

  const filteredItems = GLOSSARY_ITEMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Beginner Financial Glossary</h2>
              <p className="text-xs text-slate-400">Simple, plain-English explanations of key financial and market terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search terms (e.g. RSI, Diversification, DTI)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-800/60">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                    <span>{item.term}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300">
                    {item.category}
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {item.definition}
                </p>

                {item.example && (
                  <div className="text-xs text-slate-300 bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                    <span className="font-semibold text-indigo-400">Real Example: </span>
                    {item.example}
                  </div>
                )}

                {item.beginnerTip && (
                  <div className="text-xs text-emerald-300 bg-emerald-950/30 rounded-lg p-2.5 border border-emerald-800/40">
                    <span className="font-semibold text-emerald-400">💡 Advisor Tip: </span>
                    {item.beginnerTip}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">No glossary terms matched "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Lumina Advisor Beginner Education Guide</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Glossary
          </button>
        </div>

      </div>
    </div>
  );
};

export default BeginnerGlossaryModal;
