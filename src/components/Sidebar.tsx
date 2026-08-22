import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Wallet,
  PieChart,
  Target,
  TrendingUp,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';

export type MainHubType =
  | 'dashboard'
  | 'copilot'
  | 'money'
  | 'investments'
  | 'goals'
  | 'market'
  | 'alerts'
  | 'documents'
  | 'settings';

interface SidebarProps {
  activeHub: MainHubType;
  setActiveHub: (hub: MainHubType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenCopilot: () => void;
  unreadAlertCount: number;
  userName: string;
  userEmail?: string;
  onLogoutRequest?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeHub,
  setActiveHub,
  isCollapsed,
  setIsCollapsed,
  onOpenCopilot,
  unreadAlertCount,
  userName,
  userEmail,
  onLogoutRequest
}) => {
  const primaryNavItems = [
    { id: 'dashboard' as MainHubType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'copilot' as MainHubType, label: 'AI Copilot', icon: Bot, isSpecial: true },
    { id: 'money' as MainHubType, label: 'Money', icon: Wallet },
    { id: 'investments' as MainHubType, label: 'Investments', icon: PieChart },
    { id: 'goals' as MainHubType, label: 'Goals', icon: Target },
    { id: 'market' as MainHubType, label: 'Market', icon: TrendingUp },
    { id: 'alerts' as MainHubType, label: 'Alerts', icon: Bell, badge: unreadAlertCount }
  ];

  const secondaryNavItems = [
    { id: 'documents' as MainHubType, label: 'Documents', icon: FileText },
    { id: 'settings' as MainHubType, label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (id: MainHubType) => {
    if (id === 'copilot') {
      onOpenCopilot();
    } else {
      setActiveHub(id);
    }
  };

  return (
    <>
      {/* Desktop Sidebar — Intentionally Dark in both Light & Dark themes */}
      <aside
        className={`hidden md:flex flex-col bg-[#08090d] border-r border-white/10 text-slate-300 transition-all duration-300 z-40 sticky top-0 h-screen ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div
            onClick={() => setActiveHub('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-blue-400 font-extrabold text-base tracking-tighter uppercase block leading-tight">
                  LUMINA AI
                </span>
                <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase block">
                  COMMAND CENTER
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Hubs */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
          <div className={`px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>
            Command Hubs
          </div>

          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeHub === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold shadow-sm'
                    : item.isSpecial
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : item.isSpecial ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Badge Indicator */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-500 text-white rounded-full ${isCollapsed ? 'absolute top-2 right-2' : 'ml-auto'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className={`pt-4 px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>
            Utilities
          </div>

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeHub === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Floating Quick Ask Pill */}
        {!isCollapsed && (
          <div className="p-3 m-3 bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Ask Lumina Anything</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-snug">
              Instant AI financial advisory & live market analysis.
            </p>
            <button
              onClick={onOpenCopilot}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold py-1.5 rounded-xl transition"
            >
              Open AI Copilot
            </button>
          </div>
        )}

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-zinc-200 block truncate">{userName || 'Authenticated User'}</span>
                <span className="text-[10px] text-zinc-500 font-mono block truncate">{userEmail || 'Pro Intelligence'}</span>
              </div>
            )}
          </div>

          {!isCollapsed && onLogoutRequest && (
            <button
              onClick={onLogoutRequest}
              title="Log out of Lumina"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08090d]/95 border-t border-white/10 backdrop-blur-md flex items-center justify-around py-2 px-1 text-slate-200">
        {[
          { id: 'dashboard' as MainHubType, label: 'Home', icon: LayoutDashboard },
          { id: 'money' as MainHubType, label: 'Money', icon: Wallet },
          { id: 'copilot' as MainHubType, label: 'AI', icon: Bot, isSpecial: true },
          { id: 'investments' as MainHubType, label: 'Invest', icon: PieChart },
          { id: 'goals' as MainHubType, label: 'Goals', icon: Target }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeHub === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : item.isSpecial
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
