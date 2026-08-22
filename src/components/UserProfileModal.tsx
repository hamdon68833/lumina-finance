import React, { useState } from 'react';
import { X, User as UserIcon, Mail, ShieldCheck, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, firebaseUser, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen || !user) return null;

  const authProviderName = firebaseUser?.providerData?.[0]?.providerId === 'google.com'
    ? 'Google Authentication'
    : 'Firebase Email / Password';

  const creationTime = firebaseUser?.metadata?.creationTime
    ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Active Account';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile & Account Settings</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Authenticated Lumina Account Identity</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1.5 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Overview */}
        <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{user.fullName}</h4>
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              VERIFIED AUTHENTICATED
            </span>
          </div>
        </div>

        {/* Profile Attributes */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">User Identifier (UID)</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold truncate max-w-[200px]">{user.id}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Auth Provider</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{authProviderName}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Account Created</span>
            <span className="font-mono text-slate-800 dark:text-zinc-200">{creationTime}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Data Isolation Status</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Strict UID Scoped</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold py-3 rounded-xl transition"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
