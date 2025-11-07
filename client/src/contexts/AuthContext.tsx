import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { User } from '@shared/schema';

type AuthContextType = {
  userId: string | null;
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, invitationCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (invitationCode?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signUp(email: string, password: string, username: string, invitationCode?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        email,
        invitationCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user profile');
    }

    const user = await response.json();
    setUserData(user);
  }

  async function signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    const user = await response.json();
    setUserData(user);
  }

  async function signInWithGoogle(invitationCode?: string) {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();

    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        googleId: result.user.uid,
        invitationCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to authenticate with Google');
    }

    const user = await response.json();
    setUserData(user);
  }

  async function logout() {
    await firebaseSignOut(auth);
    setUserData(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUserData(userData);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{
      userId: userData?.id || null,
      currentUser,
      userData,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
