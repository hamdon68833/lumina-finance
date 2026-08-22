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
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { User } from './types';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
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
  signInWithGoogle: () => Promise<User>;
  getFriendlyErrorMessage: (error: any) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || error.message || '';

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
    return 'Unable to connect to authentication server. Please check your internet connection.';
  }
  if (code.includes('popup-closed-by-user')) {
    return 'Google Sign-In was cancelled.';
  }

  return 'Something went wrong while authenticating. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Sync Firebase Auth State Changes & Multi-Tab Logout Handling
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

        // Fetch or Initialize Firestore Profile
        try {
          if (db) {
            const userRef = doc(db, 'users', fbUser.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfileData);
            } else {
              // Create minimum safe profile without dummy numbers
              const newProfile: UserProfileData = {
                uid: fbUser.uid,
                name: fbUser.displayName || mappedUser.fullName,
                email: fbUser.email || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            }
          }
        } catch {
          /* Fallback profile silently */
        }
      } else {
        // Clear all authenticated user state
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

    // Save initial Firestore profile
    if (db && cred.user) {
      try {
        const userRef = doc(db, 'users', cred.user.uid);
        await setDoc(userRef, {
          uid: cred.user.uid,
          name: fullName.trim(),
          email: email.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch {
        /* silent fallback */
      }
    }

    return u;
  };

  const signInWithGoogle = async (): Promise<User> => {
    if (!auth) throw new Error('Authentication is currently offline.');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const u: User = {
      id: cred.user.uid,
      username: cred.user.email ? cred.user.email.split('@')[0] : 'google_user',
      email: cred.user.email || '',
      fullName: cred.user.displayName || 'Google User'
    };
    setUser(u);
    return u;
  };

  const signOutUser = async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('lumina_user');
    // Clear transient user session state
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
        getFriendlyErrorMessage: getFriendlyAuthErrorMessage
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
