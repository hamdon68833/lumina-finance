import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';

export interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[LUMINA ERROR BOUNDARY]', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                Lumina Finance couldn't load this workspace.
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An application error occurred. Your financial data has not been changed.
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800/80 pb-1 text-[10px] uppercase">
                <span>Diagnostic Error Code</span>
                <span>SAFEGUARD ACTIVE</span>
              </div>
              <p className="text-rose-400 font-semibold break-all">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>All stored financial profiles & Firestore records remain intact.</span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
