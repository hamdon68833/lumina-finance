import React from 'react';
import { X, BarChart2, Bot, Sliders, ShieldAlert, ArrowRight } from 'lucide-react';
import { SmartAlert } from '../../alert_rules';

interface AlertActionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alert: SmartAlert | null;
  onNavigateToSimulator: () => void;
  onNavigateToCopilot: (promptText: string) => void;
  onNavigateToStep: (stepNumber: number) => void;
}

export const AlertActionPanel: React.FC<AlertActionPanelProps> = ({
  isOpen,
  onClose,
  alert,
  onNavigateToSimulator,
  onNavigateToCopilot,
  onNavigateToStep,
}) => {
  if (!isOpen || !alert) return null;

  const handleAskCopilot = () => {
    const prompt = `Explain why you generated this alert: "${alert.title}" (${alert.type} - ${alert.severity}). How does it impact my overall financial strategy?`;
    onNavigateToCopilot(prompt);
    onClose();
  };

  const handleSimulate = () => {
    onNavigateToSimulator();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl text-[#fafafa] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Deep Impact Analysis</h3>
              <p className="text-xs text-zinc-400 font-mono">Alert ID: {alert.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Title & Badge */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {alert.type}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {alert.severity} SEVERITY
              </span>
            </div>
            <h4 className="text-base font-bold text-zinc-100">{alert.title}</h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{alert.summary}</p>
          </div>

          {/* Key Calculations */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-2">
              Verified Calculations & Parameters
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(alert.calculations).map(([key, val]) => (
                <div key={key} className="bg-zinc-950 p-2 rounded border border-white/5 font-mono">
                  <span className="text-zinc-500 text-[11px] block">{key}</span>
                  <span className="text-blue-400 font-bold">{typeof val === 'number' ? val.toLocaleString() : String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini AI Rationale */}
          <div className="bg-blue-950/20 border border-blue-500/30 p-4 rounded-xl text-xs space-y-1.5">
            <span className="text-blue-400 font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Bot className="w-4 h-4" /> Lumina AI Explanation
            </span>
            <p className="text-zinc-200 leading-relaxed font-sans">{alert.geminiExplanation}</p>
          </div>

          {/* Recommendations */}
          {alert.recommendations && alert.recommendations.length > 0 && (
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 text-xs space-y-2">
              <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider block">
                Recommended Decision-Support Steps
              </span>
              <ul className="space-y-1.5 text-zinc-300">
                {alert.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strategic Decision Actions */}
          <div className="pt-2 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Execution Routing (Non-Transaction)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleAskCopilot}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Ask Lumina Copilot</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSimulate}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Simulate What-If</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              {alert.type === 'EMERGENCY_FUND' && (
                <button
                  onClick={() => { onNavigateToStep(4); onClose(); }}
                  className="col-span-full flex items-center justify-between p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    <span>Open Emergency Reserve Planner</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {alert.type === 'PORTFOLIO' && (
                <button
                  onClick={() => { onNavigateToStep(7); onClose(); }}
                  className="col-span-full flex items-center justify-between p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                    <span>Open Asset Allocation Dashboard</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-zinc-950 text-center text-[10px] text-zinc-500">
          Lumina AI Decision-Support System • No Automatic Transactions Executed
        </div>
      </div>
    </div>
  );
};
