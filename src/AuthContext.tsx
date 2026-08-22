import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { User } from './types';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  createdAt?: any;
  updatedAt?: any;
  income?: number | null;
  expenses?: number | null;
  currentLiquidReserve?: number | null;
  age?: number | null;
  riskPreference?: string | null;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  userProfile: UserProfileData | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  isFirebaseConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<User>;
  signUp: (email: string, pass: string, fullName: string) => Promise<User>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  getFriendlyErrorMessage: (error: any) => string;
  isMobile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mobile browser detection helper to safely distinguish desktop vs mobile clients
 */
export const isMobileBrowser = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
};

export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const code = String(error.code || error.message || error || '').toLowerCase();

  if (code.includes('popup-closed-by-user')) {
    return 'Google sign-in was cancelled.';
  }
  if (code.includes('popup-blocked')) {
    return 'Your browser blocked the Google sign-in window. Please allow popups or use the mobile sign-in option.';
  }
  if (code.includes('unauthorized-domain')) {
    return 'This application domain is not authorized for Google sign-in. Please add your domain to Authorized Domains in Firebase Console.';
  }
  if (code.includes('operation-not-allowed')) {
    return 'Google sign-in is not enabled in your Firebase Console.';
  }
  if (code.includes('account-exists-with-different-credential')) {
    return 'An account already exists with another sign-in method.';
  }
  if (code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('user-not-found')) {
    return 'No account was found with this email address.';
  }
  if (code.includes('email-already-in-use')) {
    return 'An account already exists with this email address.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  if (code.includes('network-request-failed')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  return 'Google sign-in could not be completed. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const isMobile = isMobileBrowser();

  // 1. Handle Mobile Google Sign-In Redirect Result On Application Startup
  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log('[FIREBASE AUTH] Google Redirect Sign-In Successful:', result.user.email, result.user.uid);
          const fbUser = result.user;
          const mappedUser: User = {
            id: fbUser.uid,
            username: fbUser.email ? fbUser.email.split('@')[0] : 'google_user',
            email: fbUser.email || '',
            fullName: fbUser.displayName || 'Google User'
          };
          setUser(mappedUser);
          localStorage.setItem('lumina_user', JSON.stringify(mappedUser));

          if (db) {
            try {
              const userRef = doc(db, 'users', fbUser.uid);
              const docSnap = await getDoc(userRef);
              if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfileData);
              } else {
                const newProfile: UserProfileData = {
                  uid: fbUser.uid,
                  name: fbUser.displayName || mappedUser.fullName,
                  email: fbUser.email || '',
                  photoURL: fbUser.photoURL || null,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                };
                await setDoc(userRef, newProfile, { merge: true });
                setUserProfile(newProfile);
              }
            } catch (err) {
              console.warn('[FIREBASE AUTH] Redirect result Firestore profile sync error:', err);
            }
          }
        }
      })
      .catch((err) => {
        console.error('[FIREBASE AUTH] Google Redirect Sign-In Exception:', {
          code: err?.code,
          message: err?.message,
          customData: err?.customData,
          email: err?.email
        });
      });
  }, []);

  // 2. Sync Firebase Auth State (Source of Truth)
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const mappedUser: User = {
          id: fbUser.uid,
          username: fbUser.email ? fbUser.email.split('@')[0] : 'user',
          email: fbUser.email || '',
          fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Lumina User'
        };
        setUser(mappedUser);
        localStorage.setItem('lumina_user', JSON.stringify(mappedUser));

        // Fetch or Initialize Firestore Profile using Firebase UID
        try {
          if (db) {
            const userRef = doc(db, 'users', fbUser.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfileData);
            } else {
              const newProfile: UserProfileData = {
                uid: fbUser.uid,
                name: fbUser.displayName || mappedUser.fullName,
                email: fbUser.email || '',
                photoURL: fbUser.photoURL || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };
              await setDoc(userRef, newProfile, { merge: true });
              setUserProfile(newProfile);
            }
          }
        } catch (err) {
          console.warn('[FIREBASE AUTH] Firestore profile load exception:', err);
        }
      } else {
        // Clear all authenticated user state on logout or unauthenticated session
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('lumina_user');
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string): Promise<User> => {
    if (!auth) throw new Error('Authentication is currently offline.');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const u: User = {
      id: cred.user.uid,
      username: cred.user.email ? cred.user.email.split('@')[0] : 'user',
      email: cred.user.email || email,
      fullName: cred.user.displayName || email.split('@')[0] || 'Lumina User'
    };
    setUser(u);
    return u;
  };

  const signUp = async (email: string, pass: string, fullName: string): Promise<User> => {
    if (!auth) throw new Error('Authentication is currently offline.');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: fullName.trim() });
    }
    const u: User = {
      id: cred.user.uid,
      username: email.split('@')[0],
      email: cred.user.email || email,
      fullName: fullName.trim() || 'Lumina User'
    };
    setUser(u);

    // Save initial Firestore profile safely with merge
    if (db && cred.user) {
      try {
        const userRef = doc(db, 'users', cred.user.uid);
        await setDoc(userRef, {
          uid: cred.user.uid,
          name: fullName.trim(),
          email: email.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('[FIREBASE AUTH] Initial Firestore profile save error:', err);
      }
    }

    return u;
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    if (!auth) throw new Error('Authentication is currently offline.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    if (isMobileBrowser()) {
      // Mobile Browser: use signInWithRedirect to prevent popup blocks & cross-domain session failures
      console.log('[FIREBASE AUTH] Initiating Mobile Google Sign-In Redirect...');
      await signInWithRedirect(auth, provider);
      return null;
    } else {
      // Desktop Browser: use signInWithPopup
      console.log('[FIREBASE AUTH] Initiating Desktop Google Sign-In Popup...');
      const cred = await signInWithPopup(auth, provider);
      const u: User = {
        id: cred.user.uid,
        username: cred.user.email ? cred.user.email.split('@')[0] : 'google_user',
        email: cred.user.email || '',
        fullName: cred.user.displayName || 'Google User'
      };
      setUser(u);

      // Create or update Firestore profile
      if (db && cred.user) {
        try {
          const userRef = doc(db, 'users', cred.user.uid);
          await setDoc(userRef, {
            uid: cred.user.uid,
            name: cred.user.displayName || u.fullName,
            email: cred.user.email || '',
            photoURL: cred.user.photoURL || null,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.warn('[FIREBASE AUTH] Popup Google profile sync warning:', err);
        }
      }

      return u;
    }
  };

  const signOutUser = async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
    setFirebaseUser(null);
    localStorage.removeItem('lumina_user');
    // Clear private financial session state
    localStorage.removeItem('lumina_income');
    localStorage.removeItem('lumina_expenses');
    localStorage.removeItem('lumina_reserve');
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) throw new Error('Authentication is currently offline.');
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        userProfile,
        authLoading,
        isAuthenticated: Boolean(user),
        isFirebaseConfigured,
        signIn,
        signUp,
        signOutUser,
        resetPassword,
        signInWithGoogle,
        getFriendlyErrorMessage: getFriendlyAuthErrorMessage,
        isMobile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
