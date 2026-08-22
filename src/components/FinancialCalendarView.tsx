import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { FinancialCalendarEngine } from '../../financial_calendar';

export const FinancialCalendarView: React.FC = () => {
  const events = FinancialCalendarEngine.getEvents({});

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <CalendarIcon className="w-6 h-6 text-cyan-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Financial Calendar & Reminders</h2>
          <p className="text-sm text-slate-400">Track upcoming EMIs, bill dates, goal contributions, and tax reminders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(ev => (
          <div key={ev.id} className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">{ev.category}</span>
              <span className="text-xs text-slate-400">{ev.date}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{ev.title}</h4>
            <div className="text-xs text-slate-300">Amount: ₹{ev.amount.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
