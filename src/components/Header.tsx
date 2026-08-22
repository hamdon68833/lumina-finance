import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Sun, Moon, Bell, FileText, Search, Sparkles, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenProfileModal?: () => void;
  onOpenSecurityModal?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  activeHubTitle?: string;
  activeHubSubtitle?: string;
  onOpenSearch?: () => void;
  onOpenCopilot?: () => void;
  onOpenNotifications?: () => void;
  onOpenDocumentIntelligence?: () => void;
  unreadAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenProfileModal,
  onOpenSecurityModal,
  theme = 'dark',
  onToggleTheme,
  isDemoMode = false,
  onToggleDemoMode,
  activeHubTitle = 'Dashboard',
  activeHubSubtitle = 'Your Financial Command Center',
  onOpenSearch,
  onOpenCopilot,
  onOpenNotifications,
  onOpenDocumentIntelligence,
  unreadAlertCount = 0,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on Outside Click or Escape key press
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="bg-white/95 dark:bg-[#09090b]/95 border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#fafafa] sticky top-0 z-40 backdrop-blur-md app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Contextual Page Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">{activeHubTitle}</h1>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono tracking-widest uppercase border-l border-slate-200 dark:border-white/10 pl-2 hidden sm:inline-block">
                LUMINA AI
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-normal">
              {activeHubSubtitle}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Global Search / Command Palette Shortcut */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
              title="Global Search (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline text-[9px] font-mono font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700">
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              title="Smart Alerts & Action Center"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Alerts</span>
              {unreadAlertCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-500 text-white rounded-full animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>
          )}

          {/* Ask Lumina AI Copilot Button */}
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-purple-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30 transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-slate-950 dark:text-amber-400" />
              <span>Ask Lumina</span>
            </button>
          )}

          {/* Document Upload Button */}
          {onOpenDocumentIntelligence && (
            <button
              onClick={onOpenDocumentIntelligence}
              title="Upload Financial Statement (OCR)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>OCR Upload</span>
            </button>
          )}

          {/* Demo Mode Toggle Button */}
          {onToggleDemoMode && (
            <button
              onClick={onToggleDemoMode}
              title="Toggle Demo Mode vs Real Stored Profile"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isDemoMode ? 'DEMO MODE' : 'REAL DATA'}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title="Toggle Light / Dark Theme"
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          )}

          {/* User Profile Badge & Dropdown */}
          {user && (
            <div ref={dropdownRef} className="relative border-l border-slate-200 dark:border-white/10 pl-2">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate max-w-[120px]">
                    {user.fullName || user.username}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 hidden md:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user.fullName || 'Authenticated User'}</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate font-mono">{user.email}</span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); if (onOpenProfileModal) onOpenProfileModal(); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2 transition"
                    >
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      <span>Profile & Account</span>
                    </button>

                    <button
                      onClick={() => { setIsProfileMenuOpen(false); if (onOpenSecurityModal) onOpenSecurityModal(); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2 transition"
                    >
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Security & Session</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-200 dark:border-zinc-800 pt-1">
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
