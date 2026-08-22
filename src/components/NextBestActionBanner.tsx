import React from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, DollarSign, Wallet } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface NextBestActionProps {
  userContext?: any;
  onActionClick?: (hub: 'money' | 'investments' | 'goals' | 'market') => void;
  className?: string;
}

export const NextBestActionBanner: React.FC<NextBestActionProps> = ({
  userContext,
  onActionClick,
  className = '',
}) => {
  const isDemoMode = Boolean(userContext?.isDemoMode);
  
  const rawInc = userContext?.income !== undefined && userContext?.income !== null ? parseFloat(userContext.income) : null;
  const rawExp = userContext?.expenses !== undefined && userContext?.expenses !== null ? parseFloat(userContext.expenses) : null;
  const rawRes = userContext?.currentLiquidReserve !== undefined && userContext?.currentLiquidReserve !== null ? parseFloat(userContext.currentLiquidReserve) : null;

  const income = rawInc !== null ? Math.max(0, rawInc) : (isDemoMode ? 65000 : 0);
  const expenses = rawExp !== null ? Math.max(0, rawExp) : (isDemoMode ? 38000 : 0);
  const savings = Math.max(0, income - expenses);
  const reserve = rawRes !== null ? Math.max(0, rawRes) : (isDemoMode ? 180000 : 0);
  const monthsCovered = expenses > 0 ? Math.round((reserve / expenses) * 10) / 10 : 0;
  
  // Holdings check for concentration
  const holdings = userContext?.holdings || [
    { ticker: 'NVDA', name: 'NVIDIA Corp', value: 125000, weight: 66.7 }
  ];
  const highConcHolding = holdings.find((h: any) => (h.weight || 0) > 20.0);

  // Evaluate Priority according to Financial Safety Order
  let priorityTag = 'HIGH PRIORITY';
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
  let title = '';
  let description = '';
  let whyMatters = '';
  let buttonLabel = '';
  let targetHub: 'money' | 'investments' | 'goals' | 'market' = 'money';

  if (!isDemoMode && rawInc === null && rawExp === null) {
    priorityTag = 'SETUP REQUIRED';
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    icon = <Wallet className="w-5 h-5 text-blue-400" />;
    title = 'Add Your Personal Financial Details';
    description = 'To receive personalized investment recommendations, enter your monthly income, expenses, and current liquid reserves.';
    whyMatters = 'Lumina analyzes your real financial context to ensure you never invest money needed for living expenses or emergency reserves.';
    buttonLabel = 'Update Financial Profile';
    targetHub = 'money';
  } else if (monthsCovered < 3.0) {
    priorityTag = 'CRITICAL SAFETY GUARDRAIL';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    icon = <ShieldAlert className="w-5 h-5 text-rose-400" />;
    title = 'Build Your Emergency Reserve First';
    description = `Your liquid reserve covers ${monthsCovered} months of essential expenses. Aim for at least 6 months (${formatINR(expenses * 6)}) before increasing stock market exposure.`;
    whyMatters = 'Investing surplus cash before securing a 6-month buffer forces you to sell investments at a loss if an unexpected emergency occurs.';
    buttonLabel = 'Build Emergency Reserve';
    targetHub = 'money';
  } else if (monthsCovered < 6.0) {
    priorityTag = 'SAFETY PRIORITY';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    icon = <ShieldAlert className="w-5 h-5 text-amber-400" />;
    title = 'Strengthen Emergency Reserve to 6 Months';
    description = `You currently have ${monthsCovered} months of expense buffer. Allocate ₹${Math.round(savings * 0.5).toLocaleString()}/month to reach your 6-month target of ${formatINR(expenses * 6)}.`;
    whyMatters = 'A solid reserve gives you the financial stability required to stay invested during market downturns.';
    buttonLabel = 'Manage Emergency Buffer';
    targetHub = 'money';
  } else if (highConcHolding) {
    priorityTag = 'PORTFOLIO RISK ALERT';
    badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    icon = <AlertTriangle className="w-5 h-5 text-purple-400" />;
    title = `Rebalance Concentration in ${highConcHolding.name || highConcHolding.ticker}`;
    description = `${highConcHolding.name || highConcHolding.ticker} represents ${highConcHolding.weight}% of your total portfolio. Consider gradually rebalancing into broader asset classes.`;
    whyMatters = 'High single-stock concentration exposes your entire portfolio to severe loss if one company faces headwinds, regardless of technical momentum.';
    buttonLabel = 'Review & Rebalance Portfolio';
    targetHub = 'investments';
  } else {
    priorityTag = 'RECOMMENDED INVESTMENT ACTION';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    title = 'Deploy Investable Surplus Into Diversified Assets';
    description = `Your financial foundation is healthy with ${monthsCovered} months of reserve buffer and a monthly surplus of ${formatINR(savings)}.`;
    whyMatters = 'Consistent monthly contributions to a diversified equity and mutual fund portfolio maximize long-term compound growth.';
    buttonLabel = 'Deploy Investable Surplus';
    targetHub = 'investments';
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-5 md:p-6 shadow-xl ${className}`}>
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeColor}`}>
              {priorityTag}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-400 font-medium">Financial Safety Order: Step 1 → Step 10</span>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 shrink-0 mt-0.5">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-sm text-slate-300 dark:text-zinc-300 mt-1 leading-relaxed">
                {description}
              </p>
              <div className="mt-2 text-xs text-indigo-300/90 bg-indigo-900/30 border border-indigo-700/40 rounded-lg p-2.5">
                <span className="font-semibold text-indigo-200">Why this matters: </span>
                {whyMatters}
              </div>
            </div>
          </div>
        </div>

        {/* Action Trigger Button */}
        <button
          onClick={() => onActionClick && onActionClick(targetHub)}
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 shrink-0 group active:scale-95 cursor-pointer"
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default NextBestActionBanner;
