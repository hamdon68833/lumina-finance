import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, MainHubType } from './components/Sidebar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DashboardView } from './components/DashboardView';
import { MoneyHubView } from './components/MoneyHubView';
import { InvestmentsHubView } from './components/InvestmentsHubView';
import { GoalsHubView } from './components/GoalsHubView';
import { MarketHubView } from './components/MarketHubView';
import { LoginPage } from './components/LoginPage';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SecuritySessionModal } from './components/SecuritySessionModal';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { VTUAcademicVivaMode } from './components/VTUAcademicVivaMode';
import { NotificationCenter } from './components/NotificationCenter';
import { MarketAlertPanel } from './components/MarketAlertPanel';
import { AlertActionPanel } from './components/AlertActionPanel';
import { FinancialEducationModal } from './components/FinancialEducationModal';
import { DocumentIntelligenceModal } from './components/DocumentIntelligenceModal';
import { BudgetData, RiskData, StockData } from './types';
import { SmartAlert, UserAlertPreferences, DEFAULT_USER_PREFERENCES } from '../alert_rules';
import { useAuth } from './AuthContext';
import { TrendingUp, Sparkles } from 'lucide-react';

export default function App() {
  const { user, authLoading, isAuthenticated, signOutUser } = useAuth();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lumina_theme') as 'dark' | 'light') || 'dark';
  });

  const [activeHub, setActiveHub] = useState<MainHubType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [isVivaOpen, setIsVivaOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Proactive Smart Alerts State
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(0);
  const [actionPanelAlert, setActionPanelAlert] = useState<SmartAlert | null>(null);
  const [alertPreferences, setAlertPreferences] = useState<UserAlertPreferences>(DEFAULT_USER_PREFERENCES);

  useEffect(() => {
    localStorage.setItem('lumina_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Financial Profile Inputs with User-Scoped LocalStorage Persistence
  const storageKey = user ? `lumina_user_${user.id}` : 'lumina_anon';

  const [income, setIncome] = useState<number>(() => {
    const saved = localStorage.getItem(`${storageKey}_income`);
    return saved ? parseFloat(saved) : 65000;
  });

  const [age, setAge] = useState<number>(() => {
    const saved = localStorage.getItem(`${storageKey}_age`);
    return saved ? parseInt(saved, 10) : 28;
  });

  const [riskPreference, setRiskPreference] = useState<string>(() => {
    return localStorage.getItem(`${storageKey}_risk_pref`) || 'High';
  });

  const [currentReserve, setCurrentReserve] = useState<number>(() => {
    const saved = localStorage.getItem(`${storageKey}_reserve`);
    return saved ? parseFloat(saved) : 180000;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_expenses`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      housing_utilities: 14000,
      food_groceries: 9500,
      transportation: 4500,
      healthcare: 3000,
      entertainment_misc: 7000,
    };
  });

  // Save user profile inputs scoped to authenticated User ID
  useEffect(() => {
    if (user) {
      localStorage.setItem(`${storageKey}_income`, income.toString());
      localStorage.setItem(`${storageKey}_age`, age.toString());
      localStorage.setItem(`${storageKey}_risk_pref`, riskPreference);
      localStorage.setItem(`${storageKey}_reserve`, currentReserve.toString());
      localStorage.setItem(`${storageKey}_expenses`, JSON.stringify(expenses));
    }
  }, [user, storageKey, income, age, riskPreference, currentReserve, expenses]);

  const totalExpenses = Object.values(expenses).reduce((a: number, b: any) => a + (parseFloat(b as string) || 0), 0);

  // Evaluated API Results
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  // Auto calculate budget & risk whenever inputs change
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCalculations = async () => {
      try {
        const budgetRes = await fetch('/api/budget/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ income: Number(income), expenses })
        });
        if (budgetRes.ok) {
          const data = await budgetRes.json();
          setBudgetData(data);
        }

        const riskRes = await fetch('/api/risk/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age, riskPreference, income: Number(income), currentReserve: Number(currentReserve) })
        });
        if (riskRes.ok) {
          const data = await riskRes.json();
          setRiskData(data);
        }
      } catch {
        /* fallback silent */
      }
    };
    fetchCalculations();
  }, [isAuthenticated, income, expenses, age, riskPreference, currentReserve]);

  // Fetch Smart Alerts periodically for authenticated user
  const evaluateAlerts = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/alerts/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userContext: {
            income: Number(income),
            expenses: Number(totalExpenses),
            currentLiquidReserve: Number(currentReserve),
            age,
            riskPreference,
            investments: [
              { ticker: 'NVDA', name: 'NVIDIA Corp', value: 300000 },
              { ticker: 'AAPL', name: 'Apple Inc', value: 150000 }
            ]
          },
          preferences: alertPreferences
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setUnreadAlertCount(data.unreadCount || 0);
      }
    } catch {
      /* fallback */
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      evaluateAlerts();
      const interval = setInterval(evaluateAlerts, 120000); // Check every 2 mins
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, income, totalExpenses, currentReserve, age, riskPreference, alertPreferences]);

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    setIsProfileModalOpen(false);
    setIsSecurityModalOpen(false);
    await signOutUser();
    setIsCopilotOpen(false);
    setActiveHub('dashboard');
  };

  const handleMarkRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    setUnreadAlertCount(prev => Math.max(0, prev - 1));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleAlertActionClick = (alert: SmartAlert) => {
    setActionPanelAlert(alert);
  };

  const netSavings = Math.max(0, Number(income) - Number(totalExpenses));
  const savingsPct = Number(income) > 0 ? Math.round((netSavings / Number(income)) * 100) : 0;
  const reserveMonths = Number(totalExpenses) > 0 ? (Number(currentReserve) / Number(totalExpenses)).toFixed(1) : '12.0';

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('lumina_demo_mode') === 'true';
  });

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      const next = !prev;
      localStorage.setItem('lumina_demo_mode', String(next));
      return next;
    });
  };

  const userContextPayload = {
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.fullName || user?.username,
    isDemoMode,
    income: isDemoMode ? (Number(income) || 65000) : Number(income),
    expenses: isDemoMode ? (Number(totalExpenses) || 38000) : Number(totalExpenses),
    currentLiquidReserve: isDemoMode ? (Number(currentReserve) || 180000) : Number(currentReserve),
    savings: isDemoMode ? netSavings : (Number(income) > 0 ? netSavings : 0),
    savingsRatio: savingsPct,
    monthsCovered: parseFloat(reserveMonths),
    age,
    riskPreference,
    budgetData,
    riskData,
    selectedStock,
    expensesDict: expenses,
    goals: isDemoMode ? [
      { id: "g1", name: "House Downpayment Goal", targetAmount: 1500000, currentSavings: 300000, monthsLeft: 36, requiredMonthly: 33300 }
    ] : [],
    investments: isDemoMode ? [
      { ticker: "NVDA", name: "NVIDIA Corp", value: 300000, quantity: 10, currentPrice: 124.8, buyPrice: 110, currency: "USD", exchange: "NASDAQ", sector: "Technology" },
      { ticker: "AAPL", name: "Apple Inc", value: 150000, quantity: 5, currentPrice: 228.4, buyPrice: 200, currency: "USD", exchange: "NASDAQ", sector: "Technology" }
    ] : []
  };

  const hubMeta: Record<MainHubType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Your Financial Command Center' },
    copilot: { title: 'AI Copilot', subtitle: 'Autonomous AI Financial Intelligence' },
    money: { title: 'Money & Cash Flow', subtitle: 'Income, Expenses, Savings & Debt' },
    investments: { title: 'Investments', subtitle: 'Portfolio Allocation & Risk Analysis' },
    goals: { title: 'Financial Goals', subtitle: 'Milestones & Timeline Acceleration' },
    market: { title: 'Market Intelligence', subtitle: 'Live Indian & Global Market Intelligence' },
    alerts: { title: 'Smart Alerts', subtitle: 'Action Center & Notification Risk Rules' },
    documents: { title: 'Document Intelligence', subtitle: 'Real Statement OCR & Provenance' },
    settings: { title: 'System Settings', subtitle: 'Profile, Preferences & Configuration' }
  };

  // 1. Session Auth Loading State Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 animate-pulse">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-lg font-black tracking-widest uppercase text-blue-400">LUMINA FINANCE</h2>
        <p className="text-xs text-zinc-400 font-mono mt-1">Securing your financial workspace...</p>
      </div>
    );
  }

  // 2. Protected Route Gate (Unauthenticated -> Redirect to Login Page)
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 3. Render Authenticated Application Hub Content
  const renderActiveHubContent = () => {
    switch (activeHub) {
      case 'money':
        return <MoneyHubView userContext={userContextPayload} onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); }} />;
      case 'investments':
        return <InvestmentsHubView userContext={userContextPayload} onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); }} />;
      case 'goals':
        return <GoalsHubView userContext={userContextPayload} onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); }} />;
      case 'market':
        return <MarketHubView userContext={userContextPayload} onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); }} />;
      case 'alerts':
        return (
          <div className="space-y-6">
            <MarketAlertPanel
              alerts={alerts}
              unreadCount={unreadAlertCount}
              onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
              onActionClick={handleAlertActionClick}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
            />
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl text-center space-y-4 max-w-xl mx-auto my-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Document Intelligence OCR</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Upload bank statements, salary slips, or loan documents for real data extraction.</p>
            <button
              onClick={() => setIsDocumentOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition"
            >
              Open Document Upload Modal
            </button>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 max-w-2xl mx-auto my-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-3">System Settings & Preferences</h3>
            <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                <span>Theme Mode</span>
                <button onClick={toggleTheme} className="bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl font-bold text-slate-900 dark:text-white">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                <span>Authenticated User</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                <span>User ID</span>
                <span className="font-mono text-slate-500 dark:text-zinc-500 text-[10px]">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Security Status</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Authenticated & Isolated
                </span>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <DashboardView
            userContext={userContextPayload}
            onNavigate={(hub) => setActiveHub(hub)}
            onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); }}
            onOpenDocumentUpload={() => setIsDocumentOpen(true)}
            unreadAlertCount={unreadAlertCount}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme bg-slate-100 text-slate-900' : 'bg-[#09090b] text-[#fafafa]'} flex font-sans selection:bg-blue-600 selection:text-white relative`}>
      
      {/* Collapsible Sidebar Navigation */}
      <Sidebar
        activeHub={activeHub}
        setActiveHub={setActiveHub}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        unreadAlertCount={unreadAlertCount}
        userName={user?.fullName || user?.username || 'Authenticated User'}
        userEmail={user?.email}
        onLogoutRequest={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Top Header */}
        <Header
          user={user}
          onLogout={() => setIsLogoutModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          isDemoMode={isDemoMode}
          onToggleDemoMode={toggleDemoMode}
          activeHubTitle={hubMeta[activeHub]?.title}
          activeHubSubtitle={hubMeta[activeHub]?.subtitle}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onOpenDocumentIntelligence={() => setIsDocumentOpen(true)}
          unreadAlertCount={unreadAlertCount}
        />

        {/* Main View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {renderActiveHubContent()}
        </main>

        {/* Footer */}
        <footer className="bg-[#09090b] border-t border-white/10 py-4 px-6 flex flex-wrap items-center justify-between gap-4 text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>SYSTEM ACTIVE</span>
            <span>|</span>
            <span>VTU BELAGAVI BE ISE MAJOR PROJECT</span>
          </div>
          <p className="text-zinc-600">
            LUMINA FINANCE AI ARCHITECT © 2025–2026 • SMART INVESTMENT STRATEGY ADVISOR
          </p>
        </footer>

      </div>

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        userContext={userContextPayload}
        initialPrompt={copilotInitialPrompt}
        currentHub={activeHub}
      />

      {/* Profile & Account Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Security & Session Modal */}
      <SecuritySessionModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onLogoutRequest={() => setIsLogoutModalOpen(true)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(hub) => { setActiveHub(hub); setIsCommandPaletteOpen(false); }}
        onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); setIsCommandPaletteOpen(false); }}
      />

      {/* Document Intelligence Upload Modal */}
      <DocumentIntelligenceModal
        isOpen={isDocumentOpen}
        onClose={() => setIsDocumentOpen(false)}
      />

      {/* Smart Alert Action Panel Drawer */}
      {actionPanelAlert && (
        <AlertActionPanel
          alert={actionPanelAlert}
          isOpen={Boolean(actionPanelAlert)}
          onClose={() => setActionPanelAlert(null)}
          onOpenCopilot={(prompt) => { setCopilotInitialPrompt(prompt || ''); setIsCopilotOpen(true); }}
        />
      )}

      {/* Academic Viva Mode Drawer */}
      <VTUAcademicVivaMode
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
      />

      {/* Financial Education Modal */}
      <FinancialEducationModal
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
      />

    </div>
  );
}
