import React, { useState, useEffect } from 'react';
import { Search, X, LayoutDashboard, Wallet, PieChart, Target, TrendingUp, Bell, FileText, Bot, Sparkles, Command } from 'lucide-react';
import { MainHubType } from './Sidebar';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (hub: MainHubType) => void;
  onOpenCopilot: (prompt?: string) => void;
  onOpenDocumentUpload: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCopilot,
  onOpenDocumentUpload
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { label: 'Dashboard — Financial Command Center', hub: 'dashboard' as MainHubType, icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Money — Cash Flow, Expenses & Debt', hub: 'money' as MainHubType, icon: Wallet, category: 'Navigation' },
    { label: 'Investments — Portfolio & Risk Analysis', hub: 'investments' as MainHubType, icon: PieChart, category: 'Navigation' },
    { label: 'Goals — House, Car, Retirement', hub: 'goals' as MainHubType, icon: Target, category: 'Navigation' },
    { label: 'Market — Indian & US Intelligence', hub: 'market' as MainHubType, icon: TrendingUp, category: 'Navigation' },
    { label: 'Alerts — Action Center', hub: 'alerts' as MainHubType, icon: Bell, category: 'Navigation' },
    { label: 'Documents — OCR Statement Verification', hub: 'documents' as MainHubType, icon: FileText, category: 'Navigation' },
    
    // Actions
    { label: 'Ask Lumina: "How am I doing financially?"', action: () => onOpenCopilot('How am I doing financially?'), icon: Sparkles, category: 'AI Action' },
    { label: 'Ask Lumina: "Can I afford a ₹1 lakh purchase?"', action: () => onOpenCopilot('Can I afford a ₹1 lakh purchase?'), icon: Sparkles, category: 'AI Action' },
    { label: 'Ask Lumina: "Why is NVIDIA falling today?"', action: () => onOpenCopilot('Why is NVIDIA falling today?'), icon: Sparkles, category: 'AI Action' },
    { label: 'Upload Statement / Document', action: onOpenDocumentUpload, icon: FileText, category: 'Action' }
  ];

  const filtered = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (item: typeof items[0]) => {
    if (item.action) {
      item.action();
    } else if (item.hub) {
      onNavigate(item.hub);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 pt-20 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-2xl p-4 shadow-2xl space-y-4">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 px-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. goals, market, risk, copilot)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-1 max-h-80 overflow-y-auto no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No matching commands or pages found.</div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Tip: Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Ctrl + K</kbd> to toggle anytime</span>
          <span>Lumina AI Command Center</span>
        </div>

      </div>
    </div>
  );
};
