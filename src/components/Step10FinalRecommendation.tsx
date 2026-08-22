import React, { useState, useRef } from 'react';
import { FileCheck, Sparkles, Printer, Copy, Check, Download, ShieldCheck, ArrowUpRight, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { User, BudgetData, RiskData, StockData } from '../types';
import { formatINR, formatINRMonthly } from '../utils/formatters';

interface Step10FinalRecommendationProps {
  user: User | null;
  budgetData: BudgetData | null;
  riskData: RiskData | null;
  selectedStock: StockData | null;
}

export const Step10FinalRecommendation: React.FC<Step10FinalRecommendationProps> = ({
  user,
  budgetData,
  riskData,
  selectedStock,
}) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Cache reference to prevent re-fetching if inputs haven't changed
  const cacheRef = useRef<{ key: string; report: string } | null>(null);

  const getFingerprint = () => {
    return JSON.stringify({
      u: user?.id || user?.fullName,
      i: budgetData?.monthlyIncome,
      e: budgetData?.totalExpenses,
      r: riskData?.riskScore,
      s: selectedStock?.ticker,
    });
  };

  const generateGeminiReport = async () => {
    const currentFingerprint = getFingerprint();
    if (cacheRef.current && cacheRef.current.key === currentFingerprint && cacheRef.current.report) {
      setAiReport(cacheRef.current.report);
      setAiError(null);
      return;
    }

    setLoadingAi(true);
    setAiError(null);
    setAiReport('');

    try {
      const res = await fetch('/api/advisor/gemini-report-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileData: user,
          budgetData,
          riskData,
          selectedStock,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulatedText += parsed.chunk;
                  setAiReport(accumulatedText);
                }
              } catch {
                // Ignore chunk parse error
              }
            }
          }
        }
      }

      if (accumulatedText) {
        cacheRef.current = { key: currentFingerprint, report: accumulatedText };
      } else {
        // Fallback to standard endpoint if streaming returned empty
        const fallbackRes = await fetch('/api/advisor/gemini-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileData: user, budgetData, riskData, selectedStock }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.report) {
          setAiReport(fallbackData.report);
          cacheRef.current = { key: currentFingerprint, report: fallbackData.report };
        } else {
          setAiError('Failed to synthesize report.');
        }
      }
    } catch (err) {
      console.error('Streaming report error, trying fallback:', err);
      try {
        const fallbackRes = await fetch('/api/advisor/gemini-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileData: user, budgetData, riskData, selectedStock }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.report) {
          setAiReport(fallbackData.report);
          cacheRef.current = { key: currentFingerprint, report: fallbackData.report };
        } else {
          setAiError('Failed to synthesize report.');
        }
      } catch (fallbackErr) {
        setAiError('Network connection error. Please try again.');
      }
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = () => {
    if (aiReport) {
      navigator.clipboard.writeText(aiReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!budgetData || !riskData) {
    return <div className="text-center py-12 text-slate-400">Loading strategy recommendation engine...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Executive Card */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 10</div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Final Strategy Blueprint & AI Advisory Report</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Visvesvaraya Technological University (VTU Belagavi) BE ISE Major Project Phase I</p>
            </div>
          </div>

          <button
            onClick={generateGeminiReport}
            disabled={loadingAi}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/80 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all shrink-0"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Synthesizing AI Report...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate AI Advisory Report</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{aiError}</span>
          </div>
        )}

        {/* 3 Core Directives Summary */}
        <div className="space-y-6 mb-8">
          
          {/* Directive 1: Emergency Reserve */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>DIRECTIVE 1: Emergency Reserve Guardrail</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3">{budgetData.advice}</p>
            <div className="flex items-center justify-between text-xs font-semibold bg-[#09090b] p-3 rounded-lg border border-white/10">
              <span className="text-zinc-500">Monthly Reserve Top-Up:</span>
              <span className="text-amber-400 font-mono font-bold">{formatINRMonthly(budgetData.emergencyMonthlyAllocation)}</span>
            </div>
          </div>

          {/* Directive 2: Net Monthly Surplus Deployment */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>DIRECTIVE 2: Monthly Investment Surplus Deployment ({formatINRMonthly(budgetData.investableMonthlySavings)})</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Strategy: <strong className="text-zinc-200">{riskData.strategyTitle}</strong> ({riskData.riskCategory} Risk Profile).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {riskData.allocations.map((alloc, idx) => (
                <div key={idx} className="bg-[#09090b] p-3 rounded-lg border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
                    <span className="text-xs font-semibold text-zinc-200">{alloc.assetClass}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">{formatINR(alloc.amount)}</span>
                    <span className="text-[10px] font-mono text-zinc-500 font-semibold">{alloc.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Directive 3: Stock Analysis Spotlight */}
          {(() => {
            const stock = selectedStock || {
              ticker: 'AAPL',
              name: 'Apple Inc.',
              currentPrice: 225.50,
              recommendation: 'BUY',
              trend: 'Bullish',
              rsi: 58,
              rationale: 'Solid market position with consistent long-term cash flow generation and upside potential.',
            };

            return (
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>DIRECTIVE 3: Tactical Stock Market Spotlight — {stock.ticker}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#09090b] p-3.5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white">{stock.name} ({stock.ticker}) — {formatINR(stock.currentPrice)}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{stock.rationale}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                      stock.recommendation === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      stock.recommendation === 'SELL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {stock.recommendation}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Directive 4: 5-Year Wealth Accumulation Roadmap */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>DIRECTIVE 4: 5-Year Wealth Accumulation Roadmap & Projections</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Projected wealth accumulation based on monthly deployment of <strong className="text-zinc-200">{formatINRMonthly(budgetData.investableMonthlySavings)}</strong> across recommended asset classes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#09090b] p-3 rounded-lg border border-white/10">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">1-Year Target</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                  {formatINR(budgetData.investableMonthlySavings * 12 * 1.05)}
                </span>
              </div>
              <div className="bg-[#09090b] p-3 rounded-lg border border-white/10">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">3-Year Target</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                  {formatINR(budgetData.investableMonthlySavings * 36 * 1.15)}
                </span>
              </div>
              <div className="bg-[#09090b] p-3 rounded-lg border border-white/10">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">5-Year Portfolio</span>
                <span className="text-sm font-mono font-bold text-purple-400 mt-1 block">
                  {formatINR(budgetData.investableMonthlySavings * 60 * 1.28)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Generated Gemini AI Report Display */}
        {aiReport ? (
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Generated Strategy Report</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 text-zinc-200 text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {aiReport}
            </div>

          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center p-6 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10 text-center">
            <Sparkles className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
            <p className="text-xs font-bold text-zinc-300">AI Advisory Report Ready for Synthesis</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-md">
              Click the <strong className="text-blue-400">"Generate AI Advisory Report"</strong> button above to synthesize the full VTU project report with Gemini AI.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
