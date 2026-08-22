import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { User } from '../types';
import { auth, isFirebaseConfigured } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface Step1UserAuthProps {
  user: User | null;
  onLoginSuccess: (user: User) => void;
  onNext: () => void;
}

export const Step1UserAuth: React.FC<Step1UserAuthProps> = ({
  user,
  onLoginSuccess,
  onNext,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('vtu_student');
  const [password, setPassword] = useState('demo123');
  const [email, setEmail] = useState('student@vtu.ac.in');
  const [fullName, setFullName] = useState('VTU ISE Student');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // If Firebase Auth is configured, attempt Firebase authentication
      if (isFirebaseConfigured && auth && email.includes('@')) {
        if (isRegister) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: fullName || username });
            const u: User = {
              id: userCredential.user.uid,
              username: username || email.split('@')[0],
              email: userCredential.user.email || email,
              fullName: fullName || username || 'Authenticated User'
            };
            onLoginSuccess(u);
            setLoading(false);
            return;
          }
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          if (userCredential.user) {
            const u: User = {
              id: userCredential.user.uid,
              username: userCredential.user.email ? userCredential.user.email.split('@')[0] : username,
              email: userCredential.user.email || email,
              fullName: userCredential.user.displayName || username || 'Authenticated User'
            };
            onLoginSuccess(u);
            setLoading(false);
            return;
          }
        }
      }

      // Fallback to Express backend authentication
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { username, email, password, fullName }
        : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      id: 'demo-user-1',
      username: 'vtu_student',
      email: 'student@vtu.ac.in',
      fullName: 'VTU ISE Student'
    });
  };

  if (user) {
    return (
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">METHODOLOGY STEP 01</div>
        <h2 className="text-xl font-semibold tracking-tight text-white mb-2">User Authenticated</h2>
        <p className="text-zinc-400 text-xs mb-6 max-w-md mx-auto">
          Logged in as <strong className="text-emerald-300">{user.fullName}</strong> (@{user.username}). All budget inputs and stock recommendations are securely linked to your session.
        </p>

        <div className="bg-zinc-900/50 rounded-xl p-4 text-left border border-white/5 mb-6 text-xs text-zinc-300 space-y-1.5 font-mono">
          <p><strong className="text-zinc-400 font-sans">User ID:</strong> {user.id}</p>
          <p><strong className="text-zinc-400 font-sans">Email:</strong> {user.email}</p>
          <p><strong className="text-zinc-400 font-sans">Session Status:</strong> Active & Persistent ({isFirebaseConfigured ? 'Firebase Auth' : 'Local Session'})</p>
        </div>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
        >
          <span>Proceed to Step 02: Data Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">METHODOLOGY STEP 01</div>
          <h2 className="text-xl font-semibold tracking-tight text-white">User Authentication</h2>
          <p className="text-zinc-400 text-xs mt-1">
            {isRegister ? 'Create a student profile' : 'Sign in to access personalized financial advisory'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl mb-4 font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VTU ISE Student"
                  className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              {isFirebaseConfigured ? 'Email Address' : 'Username or Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type={isFirebaseConfigured ? 'email' : 'text'}
                required
                value={isFirebaseConfigured ? email : username}
                onChange={(e) => {
                  if (isFirebaseConfigured) {
                    setEmail(e.target.value);
                    setUsername(e.target.value.split('@')[0]);
                  } else {
                    setUsername(e.target.value);
                  }
                }}
                placeholder={isFirebaseConfigured ? 'student@vtu.ac.in' : 'vtu_student'}
                className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {isRegister && !isFirebaseConfigured && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@vtu.ac.in"
                  className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center space-y-3">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register Here'}
          </button>

          <div>
            <button
              onClick={handleDemoLogin}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Login as Demo Student</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
