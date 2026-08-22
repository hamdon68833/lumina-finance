import React, { useState, useEffect, useRef } from 'react';
import { Search, X, LayoutDashboard, Wallet, PieChart, Target, TrendingUp, Bell, FileText, Sparkles, Settings, Activity } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = [
    // Navigations
    { label: 'Dashboard — Financial Command Center', hub: 'dashboard' as MainHubType, icon: LayoutDashboard, category: 'Navigation', keywords: 'home main overview health' },
    { label: 'Money — Cash Flow, Income & Expenses', hub: 'money' as MainHubType, icon: Wallet, category: 'Navigation', keywords: 'income expenses savings cashflow budget' },
    { label: 'Investments — Portfolio & Asset Allocation', hub: 'investments' as MainHubType, icon: PieChart, category: 'Navigation', keywords: 'portfolio stocks risk nvda aapl holdings rebalance' },
    { label: 'Goals — House Downpayment & Milestones', hub: 'goals' as MainHubType, icon: Target, category: 'Navigation', keywords: 'house retirement timeline save' },
    { label: 'Market — Live Indian & US Intelligence', hub: 'market' as MainHubType, icon: TrendingUp, category: 'Navigation', keywords: 'nifty sensex stock news ticker' },
    { label: 'Alerts — Smart Action Center', hub: 'alerts' as MainHubType, icon: Bell, category: 'Navigation', keywords: 'notifications risk warnings' },
    { label: 'Documents — Financial Statement OCR', hub: 'documents' as MainHubType, icon: FileText, category: 'Navigation', keywords: 'ocr statement upload pdf bank' },
    { label: 'Settings — System Preferences & Profile', hub: 'settings' as MainHubType, icon: Settings, category: 'Navigation', keywords: 'theme dark light account password' },

    // Financial Actions
    { label: 'Ask Lumina: "How can I optimize my monthly cash flow?"', action: () => onOpenCopilot('How can I optimize my monthly cash flow?'), icon: Sparkles, category: 'AI Action', keywords: 'cash flow budget savings income' },
    { label: 'Ask Lumina: "Analyze my investment portfolio risk"', action: () => onOpenCopilot('Analyze my investment portfolio risk and asset allocation'), icon: Sparkles, category: 'AI Action', keywords: 'portfolio risk nvda stock allocation' },
    { label: 'Ask Lumina: "How can I reduce NVDA single stock concentration?"', action: () => onOpenCopilot('How can I rebalance my portfolio to reduce NVDA single stock concentration?'), icon: Sparkles, category: 'AI Action', keywords: 'rebalance nvidia concentration' },
    { label: 'Ask Lumina: "How can I reach my house goal faster?"', action: () => onOpenCopilot('How can I reach my house goal faster?'), icon: Sparkles, category: 'AI Action', keywords: 'house goal milestone timeline' },
    { label: 'Ask Lumina: "How is the Indian market today?"', action: () => onOpenCopilot('How is the Indian market today?'), icon: Sparkles, category: 'AI Action', keywords: 'nifty market sensex indian' },
    { label: 'Ask Lumina: "What is my financial health score?"', action: () => onOpenCopilot('What is my financial health score?'), icon: Activity, category: 'AI Action', keywords: 'health score overall rank' },

    // Core Actions
    { label: 'Upload Financial Statement (OCR)', action: onOpenDocumentUpload, icon: FileText, category: 'Action', keywords: 'upload ocr document bank pdf' },
    { label: 'Analyze Expense Categories', action: () => { onNavigate('money'); onOpenCopilot('Can you analyze my monthly expense breakdown into categories and show where I can save the most?'); }, icon: Wallet, category: 'Action', keywords: 'expense categories spending' },
    { label: 'Check Portfolio Risk', action: () => { onNavigate('investments'); onOpenCopilot('Analyze my investment portfolio risk'); }, icon: PieChart, category: 'Action', keywords: 'portfolio risk asset' },
    { label: 'View Live Market Tickers', action: () => onNavigate('market'), icon: TrendingUp, category: 'Action', keywords: 'market tickers live nifty' },
    { label: 'View Smart Alerts', action: () => onNavigate('alerts'), icon: Bell, category: 'Action', keywords: 'alerts warnings' }
  ];

  const filtered = items.filter(i => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || (i.keywords && i.keywords.toLowerCase().includes(q));
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside & keyboard event handler (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered.length > 0 && filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  const handleSelect = (item: typeof items[0]) => {
    if (item.action) {
      item.action();
    } else if (item.hub) {
      onNavigate(item.hub);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div ref={modalRef} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-2xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* Search Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3 px-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, hubs, AI queries (e.g., portfolio, cash flow, goals, market)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none font-medium"
          />
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-1 max-h-96 overflow-y-auto no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-500">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold truncate">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Navigation Footer */}
        <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold">↑</kbd>
              <kbd className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span>Lumina AI Command Center</span>
        </div>

      </div>
    </div>
  );
};
