import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, ArrowUpRight, Info } from 'lucide-react';
import { formatINR, formatINRMonthly } from '../utils/formatters';

export type CopilotAgentStatus =
  | 'IDLE'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'EXECUTING_TOOLS'
  | 'GENERATING'
  | 'SUCCESS'
  | 'NEEDS_INPUT'
  | 'ERROR';

export interface AgentAction {
  label: string;
  action: string;
  target?: string;
  prompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  intent?: string;
  intentLabel?: string;
  mode?: 'GENERAL_AI' | 'FINANCIAL' | 'MARKET' | 'CURRENT_INFO' | 'DOCUMENT' | string;
  summary?: string;
  calculations?: any;
  recommendations?: string[];
  warnings?: string[];
  missingData?: string[];
  sources?: string[];
  dataFreshness?: string;
  confidence?: string;
  actions?: AgentAction[];
}

const FormattedMarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const cleaned = text
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/\\\\\*/g, '*')
    .replace(/\\\*/g, '*');

  const lines = cleaned.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="space-y-1.5 my-2 pl-1">
          {currentList.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-800 dark:text-slate-200">
              <span className="text-amber-500 font-bold mt-0.5">•</span>
              <span>{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`list-${idx}`);
      return;
    }

    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList(`list-${idx}`);
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      elements.push(
        <h4 key={`head-${idx}`} className="text-[12px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-3.5 mb-1.5">
          {headerText}
        </h4>
      );
    } else if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const cleanItem = trimmed.replace(/^[•\*\-]\s*/, '');
      currentList.push(cleanItem);
    } else if (trimmed.startsWith('```')) {
      flushList(`list-${idx}`);
      const codeLines = trimmed.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
      elements.push(
        <pre key={`code-${idx}`} className="bg-slate-900 text-slate-100 dark:bg-black/60 dark:text-emerald-300 p-3 rounded-xl text-[11px] font-mono border border-slate-700/80 overflow-x-auto my-2 shadow-inner">
          <code>{codeLines}</code>
        </pre>
      );
    } else {
      flushList(`list-${idx}`);
      elements.push(
        <p key={`p-${idx}`} className="leading-relaxed text-[12px] text-slate-800 dark:text-slate-200 my-1">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList(`list-final`);

  return <div className="space-y-1 font-normal">{elements}</div>;
};

function renderInlineFormatting(str: string) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return <strong key={i} className="font-bold text-slate-900 dark:text-white">{inner}</strong>;
    }
    return part;
  });
}

function hasMeaningfulMetrics(calc: any): boolean {
  if (!calc || typeof calc !== 'object') return false;
  const keys = Object.keys(calc);
  if (keys.length === 0) return false;
  let count = 0;
  for (const k of keys) {
    const val = calc[k];
    if (val !== null && val !== undefined && val !== '' && val !== 0 && k !== 'isDemoData' && k !== 'status') {
      count++;
    }
  }
  return count >= 1;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userContext: any;
  initialQuestion?: string;
  currentHub?: string;
  selectedGoal?: any;
  selectedAlert?: any;
  selectedDocument?: any;
  selectedEntity?: any;
  onNavigate?: (hub: any) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  userContext,
  initialQuestion,
  currentHub,
  selectedGoal,
  selectedAlert,
  selectedDocument,
  selectedEntity,
  onNavigate
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: "Hello! I am Lumina AI. I can analyze your cash flow, optimize financial goals, evaluate risk, provide market insights, as well as answer general knowledge and coding questions. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<CopilotAgentStatus>('IDLE');
  const [loadingStatus, setLoadingStatus] = useState('Understanding your question...');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastHandledInitialQuestionRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  const appendMessage = (msg: Message) => {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  };

  // User Data Isolation: Reset AI Conversation state whenever authenticated user changes
  const activeUserId = userContext?.userId;
  useEffect(() => {
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'bot',
        text: "Hello! I am Lumina AI. I can analyze your cash flow, optimize financial goals, evaluate risk, provide market insights, as well as answer general knowledge and coding questions. How can I help you today?"
      }
    ]);
  }, [activeUserId]);

  useEffect(() => {
    if (isOpen && initialQuestion && initialQuestion.trim() !== lastHandledInitialQuestionRef.current) {
      lastHandledInitialQuestionRef.current = initialQuestion.trim();
      handleSend(undefined, initialQuestion);
    }
  }, [isOpen, initialQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const query = (customQuery || input).trim();
    if (!query) return;

    if (isProcessingRef.current && !customQuery) return;
    isProcessingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    const userMsgId = `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userMsg: Message = { id: userMsgId, sender: 'user', text: query };
    
    appendMessage(userMsg);
    if (!customQuery) setInput('');
    setLoading(true);
    setAgentStatus('UNDERSTANDING');
    setLoadingStatus('Understanding your question...');

    const t1 = setTimeout(() => {
      if (requestIdRef.current === currentRequestId) {
        setAgentStatus('PLANNING');
        setLoadingStatus('Checking your financial context...');
      }
    }, 500);

    const t2 = setTimeout(() => {
      if (requestIdRef.current === currentRequestId) {
        setAgentStatus('EXECUTING_TOOLS');
        setLoadingStatus('Running verified calculations...');
      }
    }, 1200);

    const t3 = setTimeout(() => {
      if (requestIdRef.current === currentRequestId) {
        setAgentStatus('GENERATING');
        setLoadingStatus('Preparing your recommendation...');
      }
    }, 2000);

    const historyPayload = messages.map(m => ({
      sender: m.sender,
      text: m.text,
      intent: m.intent as any,
      calculations: m.calculations,
      missingData: m.missingData
    }));

    try {
      const response = await fetch('/api/advisor/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          userContext,
          history: historyPayload,
          currentHub,
          selectedGoal,
          selectedAlert,
          selectedDocument,
          selectedEntity
        }),
        signal: controller.signal
      });

      if (requestIdRef.current !== currentRequestId) return;

      if (!response.ok) {
        throw new Error(`Copilot request failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (requestIdRef.current !== currentRequestId) return;

      const isNeedsInput = data.status === 'NEEDS_INPUT' || (data.missingData && data.missingData.length > 0);
      setAgentStatus(isNeedsInput ? 'NEEDS_INPUT' : 'SUCCESS');

      const botMsgId = `msg-bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const botMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: data.answer || 'Analysis complete.',
        intent: data.intent,
        intentLabel: data.intentLabel || data.intent,
        mode: data.mode,
        summary: data.summary,
        calculations: data.calculations || {},
        recommendations: data.recommendations || [],
        warnings: data.warnings || [],
        missingData: data.missingData || [],
        sources: data.sources || [],
        dataFreshness: data.dataFreshness || 'Based on your current profile',
        confidence: data.confidence || 'HIGH',
        actions: data.actions || []
      };

      appendMessage(botMsg);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('[COPILOT] Request cancelled or timed out');
      } else {
        console.error('[COPILOT] Error:', err);
        if (requestIdRef.current === currentRequestId) {
          setAgentStatus('ERROR');
          const errId = `msg-err-${Date.now()}`;
          appendMessage({
            id: errId,
            sender: 'bot',
            text: 'I couldn\'t complete that analysis right now. Your financial data has not been changed. Please try again.',
            warnings: [err.message || 'Network connection issue']
          });
        }
      }
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
        isProcessingRef.current = false;
      }
    }
  };

  const handleActionClick = (act: AgentAction) => {
    if (act.action === 'NAVIGATE' && act.target && onNavigate) {
      onNavigate(act.target);
    } else if (act.action === 'PROMPT' && act.prompt) {
      handleSend(undefined, act.prompt);
    }
  };

  const getModeBadgeStyle = (mode?: string) => {
    if (mode === 'GENERAL_AI') return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
    if (mode === 'MARKET') return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    if (mode === 'CURRENT_INFO') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    if (mode === 'DOCUMENT') return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-[#0c0c0e] border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 flex flex-col font-sans copilot-drawer">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/60 backdrop-blur-md copilot-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm copilot-header-title">Lumina AI Agent</h3>
              <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                {currentHub ? currentHub.toUpperCase() : 'INTELLIGENT'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 copilot-header-subtitle">Financial Intelligence Copilot</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors copilot-close-btn">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            
            {/* User Bubble */}
            {m.sender === 'user' ? (
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-semibold bg-amber-500 text-slate-950 shadow-md">
                {m.text}
              </div>
            ) : (
              /* Bot Response Card */
              <div className="w-full max-w-[98%] rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-4 text-xs text-slate-800 dark:text-slate-200 space-y-3 shadow-xl backdrop-blur-sm copilot-bot-card">
                
                {/* Intent/Mode Badge Header */}
                {(m.intent || m.mode) && (
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getModeBadgeStyle(m.mode)}`}>
                      {m.mode === 'GENERAL_AI' ? 'GENERAL AI' : (m.intentLabel || m.intent)}
                    </span>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      <span>{m.dataFreshness || 'Based on your current profile'}</span>
                    </span>
                  </div>
                )}

                {/* Calculation Metric Cards - ONLY rendered if meaningful metrics exist */}
                {m.mode !== 'GENERAL_AI' && hasMeaningfulMetrics(m.calculations) && (
                  <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-2 copilot-calc-box">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Numbers</span>
                      {m.calculations.status && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {m.calculations.status}
                        </span>
                      )}
                    </div>

                    {/* Affordability Metrics Grid */}
                    {m.intent === 'AFFORDABILITY' && (
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Purchase Item</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatINR(m.calculations.purchaseAmount || 0)}</span>
                        </div>
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Savings Ratio Impact</span>
                          <span className="font-bold text-amber-600 dark:text-amber-300">{m.calculations.purchaseToSavingsRatio}%</span>
                        </div>
                      </div>
                    )}

                    {/* Goal Optimization Metrics Grid */}
                    {m.intent === 'GOAL_OPTIMIZATION' && (
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Goal Target</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatINR(m.calculations.targetAmount || 1500000)}</span>
                        </div>
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Required Contribution</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINRMonthly(m.calculations.requiredMonthlyContribution || 33333)}</span>
                        </div>
                      </div>
                    )}

                    {/* Budget Metrics Grid */}
                    {(m.intent === 'BUDGET_ANALYSIS' || m.intent === 'HEALTH_SCORE') && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[9.5px]">Monthly Income</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatINR(m.calculations.income || m.calculations.monthlyIncome || 6500)}</span>
                        </div>
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[9.5px]">Monthly Expenses</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{formatINR(m.calculations.expenses || m.calculations.totalExpenses || 3800)}</span>
                        </div>
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[9.5px]">Net Monthly Savings</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(m.calculations.monthlySavings ?? m.calculations.netMonthlySavings ?? 2700)}</span>
                        </div>
                        <div className="bg-slate-100/80 dark:bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 dark:text-slate-400 block text-[9.5px]">Savings Rate</span>
                          <span className="font-bold text-amber-600 dark:text-amber-300">{m.calculations.savingsRatio ? `${m.calculations.savingsRatio.toFixed(1)}%` : '41.5%'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Response Text */}
                <FormattedMarkdownText text={m.text} />

                {/* Interactive Action Buttons */}
                {m.actions && m.actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-200 dark:border-white/5">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        {act.label}
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        ))}

        {/* Dynamic Step-by-Step Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{loadingStatus}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Buttons */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-black/30 border-t border-slate-200 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          'How can I optimize my monthly cash flow?',
          'What if I save another ₹500?',
          'How much would that be in a year?',
          'How is the Indian market today?'
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(undefined, q)}
            className="whitespace-nowrap text-[10.5px] bg-slate-200/80 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-full transition-all shrink-0 font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#09090b]">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl p-1.5 focus-within:border-amber-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lumina anything (e.g. cash flow, save another ₹500, Python)..."
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-8 h-8 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-lg flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
};
