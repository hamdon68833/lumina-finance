import React from 'react';
import { 
  UserCheck, 
  User, 
  Receipt, 
  Wallet, 
  ShieldAlert, 
  BrainCircuit, 
  PieChart, 
  TrendingUp, 
  BarChart3, 
  FileCheck 
} from 'lucide-react';

interface StepNavigationProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  completedSteps: number[];
}

export const stepsList = [
  { id: 1, num: '01', title: 'Step 01', label: 'AUTH', icon: UserCheck, desc: 'User Login & Persistence' },
  { id: 2, num: '02', title: 'Step 02', label: 'COLLECTION', icon: User, desc: 'Income, Age & Risk Pref' },
  { id: 3, num: '03', title: 'Step 03', label: 'EXPENSES', icon: Receipt, desc: 'Expense Categorization' },
  { id: 4, num: '04', title: 'Step 04', label: 'SAVINGS', icon: Wallet, desc: 'Savings = Income - Expenses' },
  { id: 5, num: '05', title: 'Step 05', label: 'EMERGENCY', icon: ShieldAlert, desc: '3-6 Months Reserve Check' },
  { id: 6, num: '06', title: 'Step 06', label: 'RISK ENGINE', icon: BrainCircuit, desc: 'Risk Profile Classification' },
  { id: 7, num: '07', title: 'Step 07', label: 'ALLOCATION', icon: PieChart, desc: 'Portfolio Asset Split' },
  { id: 8, num: '08', title: 'Step 08', label: 'MARKET DATA', icon: TrendingUp, desc: 'Technical & News Sentiment' },
  { id: 9, num: '09', title: 'Step 09', label: 'VISUALIZATION', icon: BarChart3, desc: 'Master Charts & Analytics' },
  { id: 10, num: '10', title: 'Step 10', label: 'ADVISORY', icon: FileCheck, desc: 'Final AI Advisory Report' }
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
  activeStep,
  setActiveStep,
  completedSteps,
}) => {
  return (
    <div className="bg-[#09090b]/95 border-b border-white/10 backdrop-blur-md overflow-x-auto py-2.5 px-4 no-scrollbar sticky top-[61px] z-40 step-nav-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[1020px] gap-1.5">
        {stepsList.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = completedSteps.includes(step.id);

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl transition-all whitespace-nowrap flex-1 min-w-[95px] max-w-[125px] border ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/60 ring-1 ring-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold active-step-item'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-medium completed-step-item'
                  : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:bg-zinc-800/60 hover:text-zinc-200 inactive-step-item'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold shrink-0 ${
                isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
              }`}>
                {step.num}
              </span>
              <span className={`text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${
                isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-300'
              }`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

