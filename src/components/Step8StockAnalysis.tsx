import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Newspaper, ArrowRight, ShieldAlert, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { StockData } from '../types';

interface Step8StockAnalysisProps {
  selectedStock: StockData | null;
  setSelectedStock: (stock: StockData) => void;
  onNext: () => void;
}

const STOCK_TICKERS = [
  { symbol: 'AAPL', label: 'Apple Inc. (AAPL)' },
  { symbol: 'NVDA', label: 'NVIDIA Corporation (NVDA)' },
  { symbol: 'MSFT', label: 'Microsoft Corporation (MSFT)' },
  { symbol: 'GOOGL', label: 'Alphabet Inc. (GOOGL)' },
  { symbol: 'RELIANCE.NS', label: 'Reliance Industries (RELIANCE.NS)' },
  { symbol: 'TCS.NS', label: 'Tata Consultancy Services (TCS.NS)' },
  { symbol: 'TSLA', label: 'Tesla Inc. (TSLA)' },
  { symbol: 'SPY', label: 'S&P 500 ETF (SPY)' },
];

export const Step8StockAnalysis: React.FC<Step8StockAnalysisProps> = ({
  selectedStock,
  setSelectedStock,
  onNext,
}) => {
  const [ticker, setTicker] = useState('AAPL');
  const [loading, setLoading] = useState(false);

  const fetchStock = async (symbol: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/analyze/${symbol}`);
      const data: StockData = await res.json();
      setSelectedStock(data);
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock(ticker);
  }, [ticker]);

  const getRecBadge = (rec: string) => {
    if (rec === 'BUY') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (rec === 'SELL') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 08</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  DEMO DATA
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Stock Market Insights & Technical Engine</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Evaluates 20-SMA, 50-SMA, RSI (14) & Financial News Sentiment for actionable signals.</p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500/50"
            >
              {STOCK_TICKERS.map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Demo Data Disclaimer Badge */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Simulated Market Data (Demo Mode):</strong> Technical indicators (20-SMA, 50-SMA, RSI) and sentiment scores are generated via internal quantitative simulation engine for educational demonstration.
          </span>
        </div>

        {loading || !selectedStock ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs">Fetching technical indicators & financial sentiment score...</div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Current Price</span>
                <span className="text-xl font-mono font-bold text-white">${selectedStock.currentPrice.toFixed(2)}</span>
                <span className="text-[11px] text-blue-400 block mt-1">{selectedStock.trend}</span>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">20-Day SMA</span>
                <span className="text-xl font-mono font-bold text-zinc-200">${selectedStock.sma20.toFixed(2)}</span>
                <span className="text-[11px] text-zinc-500 block mt-1">50-SMA: ${selectedStock.sma50.toFixed(2)}</span>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">RSI Indicator (14)</span>
                <span className="text-xl font-mono font-bold text-amber-400">{selectedStock.rsi.toFixed(1)}</span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  {selectedStock.rsi > 70 ? 'Overbought' : selectedStock.rsi < 35 ? 'Oversold' : 'Neutral Zone'}
                </span>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">News Sentiment</span>
                <span className={`text-xl font-mono font-bold ${selectedStock.newsSentiment > 0.15 ? 'text-emerald-400' : selectedStock.newsSentiment < -0.15 ? 'text-rose-400' : 'text-zinc-200'}`}>
                  {selectedStock.newsSentiment > 0 ? `+${selectedStock.newsSentiment.toFixed(2)}` : selectedStock.newsSentiment.toFixed(2)}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">{selectedStock.sentimentLabel} Sentiment</span>
              </div>

            </div>

            {/* Recommendation Box */}
            <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${getRecBadge(selectedStock.recommendation)}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">AI Signal Recommendation:</span>
                  <span className="text-lg font-mono font-extrabold uppercase px-3 py-0.5 rounded-lg bg-[#09090b] border border-current">
                    {selectedStock.recommendation}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">{selectedStock.rationale}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <div className="bg-[#09090b] px-3.5 py-2 rounded-xl border border-white/10">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Target Price</span>
                  <span className="text-emerald-400 font-mono font-bold">${selectedStock.targetPrice.toFixed(2)}</span>
                </div>
                <div className="bg-[#09090b] px-3.5 py-2 rounded-xl border border-white/10">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Stop Loss</span>
                  <span className="text-rose-400 font-mono font-bold">${selectedStock.stopLoss.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                {selectedStock.ticker} 30-Day Price Movement & Moving Average Overlay (Demo Data)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedStock.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#71717a" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#FFF' }} />
                    <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2.5} name="Close Price ($)" dot={false} />
                    <Line type="monotone" dataKey="sma20" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" name="20-Day SMA ($)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Proceed to Step 09: Master Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
