import React, { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';
import { FinancialEducationEngine } from '../../financial_education_engine';

interface FinancialEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialEducationModal: React.FC<FinancialEducationModalProps> = ({ isOpen, onClose }) => {
  const [selectedTerm, setSelectedTerm] = useState("ETF");
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");

  if (!isOpen) return null;

  const conceptData = FinancialEducationEngine.explainConcept(selectedTerm, level);
  const termsList = ["ETF", "SIP", "CAGR", "DIVERSIFICATION", "EMERGENCY_FUND"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Financial Education Hub</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {termsList.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedTerm === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-slate-850 p-1 rounded-xl border border-slate-800">
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${level === lvl ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="bg-slate-850 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-400">{conceptData.term}</span>
            <span className="text-xs bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">{level}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{conceptData.explanation}</p>
        </div>

        <p className="text-xs text-slate-500 italic">{conceptData.disclaimer}</p>
      </div>
    </div>
  );
};
