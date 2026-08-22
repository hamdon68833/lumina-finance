import React, { useState } from 'react';
import { X, Shield, Lock, Key, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface SecuritySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutRequest: () => void;
}

export const SecuritySessionModal: React.FC<SecuritySessionModalProps> = ({
  isOpen,
  onClose,
  onLogoutRequest
}) => {
  const { user, firebaseUser, resetPassword, getFriendlyErrorMessage } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handlePasswordReset = async () => {
    setLoading(true);
    setMsg('');
    setError('');

    try {
      if (user.email) {
        await resetPassword(user.email);
        setMsg(`Password reset instructions sent to ${user.email}`);
      } else {
        setError('User email address unavailable.');
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const lastSignInTime = firebaseUser?.metadata?.lastSignInTime
    ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Current Active Session';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security & Active Session</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Authentication Controls & Session Verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1.5 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banners */}
        {msg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 rounded-2xl flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Security Parameters */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Session Status</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active & Verified
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Account Email</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">{user.email}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Last Sign-in</span>
            <span className="font-mono text-slate-700 dark:text-zinc-300 text-[11px]">{lastSignInTime}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Multi-Tab Session Sync</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">Enabled</span>
          </div>
        </div>

        {/* Security Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs font-bold py-3 rounded-xl border border-slate-300 dark:border-zinc-700 transition flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-blue-500" />
            <span>{loading ? 'Sending Reset Email...' : 'Send Password Reset Email'}</span>
          </button>

          <button
            onClick={() => { onClose(); onLogoutRequest(); }}
            className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold py-3 rounded-xl border border-rose-200 dark:border-rose-800/60 transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Sign Out From Current Session</span>
          </button>
        </div>

      </div>
    </div>
  );
};
