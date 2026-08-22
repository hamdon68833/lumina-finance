import React, { useState } from 'react';
import { TrendingUp, Globe, Sparkles, Newspaper, ArrowUpRight, ShieldAlert, BarChart2, Info } from 'lucide-react';
import { WatchlistItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CompanyLogo } from './CompanyLogo';
import { NextBestActionBanner } from './NextBestActionBanner';
import { CompanyLogoService } from '../../company_logo_service';
import { WatchlistEngine } from '../../watchlist_engine';
import { AssetDetailModal } from './AssetDetailModal';

interface MarketHubViewProps {
  userContext?: any;
  onOpenCopilot: (prompt?: string) => void;
}

export const MarketHubView: React.FC<MarketHubViewProps> = ({ userContext, onOpenCopilot }) => {
  const [selectedAsset, setSelectedAsset] = useState<WatchlistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const watchlist: WatchlistItem[] = WatchlistEngine.getWatchlist(userContext);

  const indianIndices = [
    { symbol: "^NSEI", name: "NIFTY 50 Index", level: 24820.00, change: 145.20, changePct: 0.59, currency: "INR" as const, isLive: true },
    { symbol: "^BSESN", name: "BSE Sensex Index", level: 81300.00, change: 480.50, changePct: 0.59, currency: "INR" as const, isLive: true }
  ];

  const usIndices = [
    { symbol: "SPY", name: "S&P 500 ETF (SPY)", level: 545.20, change: 2.80, changePct: 0.51, currency: "USD" as const, isLive: true },
    { symbol: "^NDX", name: "Nasdaq 100 Index", level: 19850.00, change: 120.40, changePct: 0.61, currency: "USD" as const, isLive: true }
  ];

  const marketNews = [
    { title: "Federal Reserve Monetary Stance & Global Tech Rally Boost Indices", source: "Financial Times", time: "Today", sentiment: "POSITIVE" },
    { title: "NVIDIA & Semiconductor Supply Chain Expansion Drives Analyst Earnings Upgrades", source: "Bloomberg", time: "Today", sentiment: "POSITIVE" },
    { title: "Indian Equity Inflows Reach Record Monthly High Supported by DII & Retail SIPs", source: "Economic Times", time: "Today", sentiment: "POSITIVE" }
  ];

  const handleAssetClick = (item: WatchlistItem) => {
    setSelectedAsset(item);
    setIsModalOpen(true);
  };

  const handleAskLuminaContext = (e: React.MouseEvent, item: WatchlistItem) => {
    e.stopPropagation();
    const priceFormatted = formatCurrency(item.price, item.currency);
    const changeFormatted = `${item.changePercent >= 0 ? '+' : ''}${item.changePercent}%`;

    const prompt = `Asset: ${item.name} (${item.ticker})
Exchange: ${item.exchange}
Current Price: ${priceFormatted}
24h Change: ${changeFormatted}
Technical Trend: ${item.trend}
Status: ${item.explainableStatus}
User Portfolio Exposure: ${item.userPortfolioExposurePct}%

How does ${item.name} (${item.ticker}) impact my portfolio risk and overall financial posture?`;

    onOpenCopilot(prompt);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Market Intelligence Command Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live Indian & Global Indices, Verified Watchlist & Explainable Technical Signals</p>
        </div>

        <button
          onClick={() => onOpenCopilot('How is the market today and how does it affect my portfolio?')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-950/40 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Ask Market Intelligence
        </button>
      </div>

      {/* Regional Indices Split (India vs US) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Indian Market */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-orange-500" /> Indian Markets (NSE / BSE)
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE MARKET
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {indianIndices.map((idx, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-1">
                <div className="flex items-center gap-2">
                  <CompanyLogo ticker={idx.symbol} name={idx.name} size="sm" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{idx.name}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(idx.level, idx.currency)}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{idx.change} (+{idx.changePct}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* US Market */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-500" /> US Global Markets (NYSE / NASDAQ)
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE MARKET
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {usIndices.map((idx, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-1">
                <div className="flex items-center gap-2">
                  <CompanyLogo ticker={idx.symbol} name={idx.name} size="sm" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{idx.name}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(idx.level, idx.currency)}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{idx.change} (+{idx.changePct}%)
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Monitored Watchlist Table & Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">Monitored Watchlist</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Decision-Support Technical Indicators & Verified Asset Provenance</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE • Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-3">Asset Identity</th>
                <th className="py-3 px-3">Live Price</th>
                <th className="py-3 px-3">24h Change</th>
                <th className="py-3 px-3">Technical Trend</th>
                <th className="py-3 px-3">Explainable Status</th>
                <th className="py-3 px-3">Portfolio Exposure</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {watchlist.map((item, idx) => {
                const logoUrl = CompanyLogoService.getLogoUrl(item.symbol || item.ticker);
                const isPositive = item.changePercent >= 0;

                return (
                  <tr
                    key={idx}
                    onClick={() => handleAssetClick(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                  >
                    {/* Logo + Ticker + Name */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <CompanyLogo ticker={item.ticker} name={item.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">{item.ticker}</span>
                            <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                              {item.exchange}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[140px]">{item.name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white font-mono text-xs">
                      {formatCurrency(item.price, item.currency)}
                    </td>

                    {/* 24h Change */}
                    <td className={`py-3.5 px-3 font-mono font-bold text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isPositive ? `+${item.changePercent}%` : `${item.changePercent}%`}
                    </td>

                    {/* Technical Trend */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {item.trend}
                    </td>

                    {/* Explainable Status */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] inline-block border ${
                        item.explainableStatus === 'Bullish Momentum' || item.explainableStatus === 'Potential Opportunity'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : item.explainableStatus === 'High Volatility' || item.explainableStatus === 'Potential Risk'
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {item.explainableStatus}
                      </span>
                    </td>

                    {/* User Portfolio Exposure */}
                    <td className="py-3.5 px-3">
                      <span className={`font-mono text-xs font-bold ${item.userPortfolioExposurePct > 20 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.userPortfolioExposurePct}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => handleAskLuminaContext(e, item)}
                        className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ml-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ask Lumina</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-3">
          {watchlist.map((item, idx) => {
            const logoUrl = CompanyLogoService.getLogoUrl(item.symbol || item.ticker);
            const isPositive = item.changePercent >= 0;

            return (
              <div
                key={idx}
                onClick={() => handleAssetClick(item)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-2xl space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt={item.ticker}
                      className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">{item.ticker}</span>
                        <span className="text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">
                          {item.exchange}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">{item.name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(item.price, item.currency)}
                    </div>
                    <div className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isPositive ? `+${item.changePercent}%` : `${item.changePercent}%`}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700/50 gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                    item.explainableStatus === 'Bullish Momentum' || item.explainableStatus === 'Potential Opportunity'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {item.explainableStatus}
                  </span>

                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                    Exposure: <strong className="text-slate-800 dark:text-slate-200 font-mono">{item.userPortfolioExposurePct}%</strong>
                  </span>

                  <button
                    onClick={(e) => handleAskLuminaContext(e, item)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 ml-auto"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Ask Lumina
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Verified Market News */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Verified Market News & Catalysts
        </div>

        <div className="space-y-3">
          {marketNews.map((news, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{news.title}</h4>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Source: {news.source}</span>
                  <span>• {news.time}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                {news.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Details Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenCopilot={onOpenCopilot}
      />

    </div>
  );
};
