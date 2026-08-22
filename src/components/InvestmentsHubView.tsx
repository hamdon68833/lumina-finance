import React, { useState } from 'react';
import { PieChart, ShieldAlert, Sparkles, Plus, FileUp, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../currency_formatter';
import { CompanyLogo } from './CompanyLogo';
import { NextBestActionBanner } from './NextBestActionBanner';
import { CompanyLogoService } from '../../company_logo_service';

interface InvestmentsHubViewProps {
  userContext: any;
  onOpenCopilot: (prompt?: string) => void;
  onOpenDocumentUpload?: () => void;
}

export const InvestmentsHubView: React.FC<InvestmentsHubViewProps> = ({
  userContext,
  onOpenCopilot,
  onOpenDocumentUpload
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const holdings = userContext?.investments || userContext?.portfolioHoldings || [];
  const isDemoMode = userContext?.isDemoMode;

  // Total Portfolio Valuation Calculation
  const totalValue = holdings.reduce((sum: number, inv: any) => sum + (parseFloat(inv.value) || 0), 0);
  const isEmpty = holdings.length === 0 && !isDemoMode;

  // Single stock max concentration
  let topHoldingSymbol = "N/A";
  let topHoldingWeightPct = 0;
  if (totalValue > 0) {
    holdings.forEach((inv: any) => {
      const weight = ((parseFloat(inv.value) || 0) / totalValue) * 100;
      if (weight > topHoldingWeightPct) {
        topHoldingWeightPct = weight;
        topHoldingSymbol = inv.ticker || inv.name || "Asset";
      }
    });
  }

  const stressTestLoss = Math.round(totalValue * 0.20);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PieChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Investment & Portfolio Intelligence
            </h2>
            {isDemoMode && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                DEMO MODE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Asset Allocation, Verified Holdings, Risk Exposure & Stress Testing</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            Add Investment
          </button>
          <button
            onClick={() => onOpenCopilot('Analyze my investment portfolio risk and asset allocation')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Portfolio Analysis
          </button>
        </div>
      </div>

      {isEmpty ? (
        /* TRUTHFUL EMPTY STATE */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <PieChart className="w-8 h-8 text-emerald-500" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              YOUR PORTFOLIO IS EMPTY
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You haven't added any investments yet. Track your actual stocks, mutual funds, and asset allocation to unlock real-time risk scores and AI rebalancing scenarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Investment
            </button>

            {onOpenDocumentUpload && (
              <button
                onClick={onOpenDocumentUpload}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
              >
                <FileUp className="w-4 h-4 text-blue-500" />
                Import Statement
              </button>
            )}

            <button
              onClick={() => onOpenCopilot('How do I build a diversified investment portfolio?')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Ask Lumina
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Portfolio Value</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalValue, "INR")}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                {holdings.length} Active Holdings
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Risk Preference</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {userContext.riskPreference || 'High'}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Growth-Oriented Baseline</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Top Holding Concentration</span>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {topHoldingWeightPct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                {topHoldingSymbol} Position Weight
              </span>
            </div>
          </div>

          {/* Real Holdings List with Company Logos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Your Verified Holdings</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{holdings.length} Assets</span>
            </div>

            <div className="space-y-3">
              {holdings.map((inv: any, i: number) => {
                const val = parseFloat(inv.value) || 0;
                const weight = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0.0";
                const logoUrl = CompanyLogoService.getLogoUrl(inv.ticker || inv.name);
                const isUS = inv.currency === "USD" || inv.exchange === "NASDAQ" || inv.exchange === "NYSE" || /NVDA|AAPL|MSFT|GOOGL|TSLA/i.test(inv.ticker);
                const currencyCode = isUS ? "USD" : "INR";

                return (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 gap-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo ticker={inv.ticker} name={inv.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{inv.name || inv.ticker}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            {inv.ticker}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {inv.exchange || (isUS ? "NASDAQ" : "NSE")} • Weight: <strong className="text-slate-800 dark:text-slate-200 font-mono">{weight}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col justify-between items-center sm:items-end">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(val, currencyCode)}
                      </div>
                      {inv.profitPct !== undefined && (
                        <div className={`text-xs font-mono font-bold flex items-center gap-1 ${inv.profitPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {inv.profitPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {inv.profitPct >= 0 ? '+' : ''}{inv.profitPct}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stress Testing & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Macro Stress Test Simulation</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Simulating a <span className="font-bold text-rose-600 dark:text-rose-400">-20% severe market downturn</span> across global tech equities.
              </p>

              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl space-y-1 text-rose-800 dark:text-rose-300">
                <span className="text-[11px] font-bold block text-rose-700 dark:text-rose-400">ESTIMATED PORTFOLIO IMPACT</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">-{formatCurrency(stressTestLoss, "INR")} (-20.0%)</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                  AI Portfolio Advisor
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Your portfolio currently exhibits single-stock concentration risk. Consider running a rebalancing simulation or expanding into broad index funds to improve your risk-adjusted return profile.
              </p>
              <button
                onClick={() => onOpenCopilot('How can I rebalance my portfolio to reduce NVDA single stock concentration?')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Run Rebalancing Scenario →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Investment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Add Investment Holding</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter ticker symbol, quantity, and buy price.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Ticker / Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. NVDA, AAPL, RELIANCE.NS, TCS.NS"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Price per Share</label>
                  <input
                    type="number"
                    placeholder="124.80"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  onOpenCopilot(`Add holding ${newTicker} quantity ${newQty} price ${newPrice}`);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
              >
                Save Holding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
