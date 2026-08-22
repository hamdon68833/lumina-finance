import React from 'react';
import { X, Sparkles, TrendingUp, TrendingDown, ShieldAlert, Newspaper, ArrowUpRight, BarChart2 } from 'lucide-react';
import { WatchlistItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CompanyLogoService } from '../../company_logo_service';

interface AssetDetailModalProps {
  asset: WatchlistItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCopilot: (prompt: string) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  isOpen,
  onClose,
  onOpenCopilot
}) => {
  if (!isOpen || !asset) return null;

  const logoUrl = CompanyLogoService.getLogoUrl(asset.symbol || asset.ticker);
  const priceFormatted = formatCurrency(asset.price, asset.currency);
  const changeFormatted = `${asset.changePercent >= 0 ? '+' : ''}${asset.changePercent}%`;
  const isPositive = asset.changePercent >= 0;

  const handleAskLuminaContext = () => {
    const fullContextPrompt = `Asset: ${asset.name} (${asset.ticker})
Exchange: ${asset.exchange}
Current Price: ${priceFormatted}
24h Change: ${changeFormatted}
Technical Trend: ${asset.trend}
Status: ${asset.explainableStatus}
User Portfolio Exposure: ${asset.userPortfolioExposurePct}%

How does ${asset.name} (${asset.ticker}) affect my current portfolio and financial strategy?`;

    onClose();
    onOpenCopilot(fullContextPrompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={asset.ticker}
              className="w-12 h-12 rounded-2xl object-contain bg-white dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CompanyLogoService.getLogoUrl("??");
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">{asset.ticker}</h3>
                <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded uppercase">
                  {asset.exchange} • {asset.currency}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{asset.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Price & Provenance Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Live Price</span>
              <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {priceFormatted}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">24H Performance</span>
              <div className={`text-xl font-extrabold font-mono flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {changeFormatted}
              </div>
            </div>

            <div className="w-full pt-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Provenence: <strong className="text-slate-800 dark:text-slate-200">{asset.provenance}</strong>
              </span>
              <span>Updated: {new Date(asset.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Technical Status</span>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{asset.explainableStatus}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Technical Indicator</span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{asset.technicalSignal}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">User Exposure</span>
              <div className={`text-xs font-mono font-bold ${asset.userPortfolioExposurePct > 20 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {asset.userPortfolioExposurePct}% Portfolio
              </div>
            </div>
          </div>

          {/* Portfolio Impact & Why It Matters */}
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Why It Matters To You</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {asset.userPortfolioExposurePct > 20 ? (
                <>
                  You hold a <strong className="text-rose-600 dark:text-rose-400">{asset.userPortfolioExposurePct}% concentration</strong> in {asset.name}. Price volatility in this single asset directly impacts your overall liquid wealth.
                </>
              ) : asset.userPortfolioExposurePct > 0 ? (
                <>
                  You have a moderate <strong className="text-emerald-600 dark:text-emerald-400">{asset.userPortfolioExposurePct}% exposure</strong> to {asset.name}. It provides growth exposure with manageable single-stock risk.
                </>
              ) : (
                <>
                  You currently have <strong>0% exposure</strong> to {asset.name}. This benchmark ticker can be monitored for potential entry points or sector diversification.
                </>
              )}
            </p>
          </div>

          {/* Decision Support Actions */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">Decision-Support Actions</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenCopilot(`Analyze investment risk and portfolio concentration for ${asset.name} (${asset.ticker})`);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                Analyze Risk
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenCopilot(`Simulate portfolio rebalancing to adjust exposure for ${asset.ticker}`);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                Simulate Allocation
              </button>
            </div>

            <button
              onClick={handleAskLuminaContext}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold p-3.5 rounded-xl shadow-lg shadow-blue-950/30 transition flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Ask Lumina with Asset Context
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
