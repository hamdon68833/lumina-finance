import React from 'react';
import { BookMarked, Plus, CheckCircle2, Clock } from 'lucide-react';
import { DecisionJournalEngine } from '../../decision_journal';

export const DecisionJournalView: React.FC = () => {
  const entries = DecisionJournalEngine.getEntries();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Financial Decision Journal</h2>
            <p className="text-sm text-slate-400">Log financial decisions, rationale, and review outcomes over time.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map(e => (
          <div key={e.id} className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{e.decisionTitle}</span>
              <span className="text-xs text-slate-400">{e.date}</span>
            </div>
            <p className="text-xs text-slate-300"><strong>Rationale:</strong> {e.rationale}</p>
            <p className="text-xs text-slate-400"><strong>Expected Outcome:</strong> {e.expectedOutcome}</p>
            {e.actualOutcome && (
              <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Actual: {e.actualOutcome}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
